# Input Sanitization & Injection Attack Prevention Plan

## Overview
This document outlines a comprehensive plan to sanitize user input and prevent injection attacks across the timeline application. The application handles various types of user input including text fields, file uploads, URL parameters, and authentication credentials.

## Current Security Posture

### Protected Areas
- ✅ **SQL Injection**: Supabase uses parameterized queries, providing protection against SQL injection
- ✅ **Authentication**: Supabase Auth handles password hashing and session management
- ✅ **File Type Validation**: Basic image type checking exists in photo upload endpoint

### Vulnerable Areas
- ❌ **XSS (Cross-Site Scripting)**: Text fields (name, description, displayName, altText) are not sanitized before storage or display
- ❌ **Path Traversal**: File names and paths are not sanitized before storage operations
- ❌ **Input Validation**: Missing length limits, format validation, and sanitization on most fields
- ❌ **URL Parameter Validation**: Route parameters (IDs) are not validated for format (UUID, etc.)
- ❌ **No Input Sanitization Library**: No centralized sanitization utility exists

## Attack Vectors Identified

### 1. Cross-Site Scripting (XSS)
**Risk Level: HIGH**

**Vulnerable Inputs:**
- Event name (`formData.name`)
- Event description (`formData.description`)
- Event type display name (`formData.displayName`)
- Photo alt text (`altText`)
- Event type name (generated from displayName)

**Attack Scenarios:**
```javascript
// Stored XSS in description
description: "<script>alert('XSS')</script>"
description: "<img src=x onerror=alert('XSS')>"
description: "javascript:alert('XSS')"

// DOM-based XSS in name
name: "<svg onload=alert('XSS')>"
```

**Impact:**
- Session hijacking
- Data theft
- Unauthorized actions on behalf of users
- Malicious code execution in user browsers

### 2. Path Traversal
**Risk Level: MEDIUM**

**Vulnerable Inputs:**
- File names in photo uploads (`file.name`)
- File extensions (`fileExt`)
- Storage paths constructed from user input

**Attack Scenarios:**
```javascript
// Path traversal in filename
fileName: "../../../etc/passwd"
fileName: "..\\..\\..\\windows\\system32\\config\\sam"

// Directory traversal in eventId
eventId: "../../other-user-id"
```

**Impact:**
- Unauthorized file access
- Data leakage
- Storage bucket corruption

### 3. NoSQL/Command Injection
**Risk Level: LOW** (Supabase uses PostgreSQL with parameterized queries)

**Note:** While Supabase protects against SQL injection, we should still validate inputs to prevent unexpected behavior.

### 4. Input Validation Issues
**Risk Level: MEDIUM**

**Problems:**
- No maximum length limits on text fields
- No format validation on dates, colors, IDs
- Missing required field validation in some endpoints
- No sanitization before database storage

## Implementation Plan

### Phase 1: Create Sanitization Utilities

#### 1.1 Install Dependencies
```bash
npm install dompurify zod
npm install --save-dev @types/dompurify
```

**Libraries:**
- **DOMPurify**: HTML sanitization for XSS prevention
- **Zod**: Schema validation and type coercion

#### 1.2 Create Sanitization Module
**File:** `src/utils/sanitize.ts`

**Functions to implement:**
- `sanitizeHtml(input: string): string` - Remove HTML/JS from text
- `sanitizeFilename(filename: string): string` - Sanitize file names
- `sanitizePath(path: string): string` - Sanitize file paths
- `sanitizeUrl(url: string): string` - Sanitize URLs
- `truncateText(text: string, maxLength: number): string` - Enforce length limits

#### 1.3 Create Validation Schemas
**File:** `src/utils/validation.ts`

**Schemas to create:**
- `EventSchema` - Validate event creation/update
- `EventTypeSchema` - Validate event type creation
- `PhotoUploadSchema` - Validate photo uploads
- `UuidSchema` - Validate UUID format for route parameters
- `EmailSchema` - Validate email format (already handled by Supabase, but add for consistency)

### Phase 2: Apply Sanitization to API Endpoints

#### 2.1 Events API (`/api/events.ts`)

**Changes needed:**
- Validate `params.id` is a valid UUID format
- Sanitize `event.name` (HTML sanitization, length limit)
- Sanitize `event.description` (HTML sanitization, length limit)
- Validate `event.date` format (ISO date string)
- Validate `event.event_type_id` is UUID format
- Strip unknown fields from request body

**Implementation:**
```typescript
import { z } from 'zod';
import { sanitizeHtml, truncateText } from '../../utils/sanitize';

const EventCreateSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeHtml),
  description: z.string().max(5000).optional().transform(val => val ? sanitizeHtml(truncateText(val, 5000)) : undefined),
  date: z.string().datetime(),
  event_type_id: z.string().uuid(),
  type: z.string().max(100).optional()
});
```

#### 2.2 Event Types API (`/api/event-types.ts`)

**Changes needed:**
- Sanitize `eventType.name` (alphanumeric + hyphens only, lowercase)
- Sanitize `eventType.displayName` (HTML sanitization, length limit)
- Validate `eventType.color` (hex color format - already done, but strengthen)
- Sanitize `eventType.icon` (whitelist of allowed icons or alphanumeric)

**Implementation:**
```typescript
const EventTypeSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(1).max(100).transform(sanitizeHtml),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().max(50).regex(/^[a-z0-9-]+$/).optional()
});
```

#### 2.3 Photos API (`/api/photos.ts`)

**Changes needed:**
- Sanitize `file.name` (remove path traversal, special chars)
- Sanitize `altText` (HTML sanitization, length limit)
- Validate `eventId` is UUID format
- Validate file extension against whitelist
- Additional file content validation (magic number checking)

**Implementation:**
```typescript
import { sanitizeFilename, sanitizeHtml } from '../../utils/sanitize';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Sanitize filename
const safeFileName = sanitizeFilename(file.name);
const fileExt = safeFileName.split('.').pop()?.toLowerCase();

if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
  return error('Invalid file extension');
}

// Sanitize alt text
const safeAltText = altText ? sanitizeHtml(truncateText(altText, 200)) : null;
```

#### 2.4 Route Parameter Validation

**Files:** 
- `/api/events/[id].ts`
- `/api/event-types/[id].ts`
- `/api/photos/[id].ts`
- `/api/photos/event/[eventId].ts`

**Changes needed:**
- Validate all `params.id` and `params.eventId` are valid UUIDs
- Return 400 Bad Request for invalid formats

**Implementation:**
```typescript
import { z } from 'zod';

const UuidParamSchema = z.object({
  id: z.string().uuid()
});

export const GET: APIRoute = async ({ params }) => {
  const validation = UuidParamSchema.safeParse(params);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: 'Invalid ID format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // ... rest of handler
};
```

#### 2.5 Auth Endpoints

**Files:**
- `/api/auth/signin.ts`
- `/api/auth/register.ts`
- `/api/auth/forgot-password.ts`
- `/api/auth/reset-password.ts`

**Changes needed:**
- Email format validation (Supabase does this, but add explicit validation)
- Password strength validation (length, complexity)
- Sanitize email (trim, lowercase)
- Validate token formats in reset-password

**Note:** Supabase handles most auth validation, but we should add client-side and server-side validation for better UX and security.

### Phase 3: Client-Side Sanitization

#### 3.1 Form Components

**Files:**
- `EventFormModal.tsx`
- `CreateEventTypeModal.tsx`
- `BirthEventFormModal.tsx`
- `PhotoUpload.tsx`

**Changes needed:**
- Add input length limits (maxLength attributes)
- Sanitize on input change (optional, for UX)
- Display sanitized preview
- Validate before submission

**Implementation:**
```typescript
// In EventFormModal.tsx
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

<input
  type="text"
  value={formData.name}
  onChange={(e) => {
    const sanitized = sanitizeHtml(e.target.value);
    if (sanitized.length <= MAX_NAME_LENGTH) {
      setFormData({ ...formData, name: sanitized });
    }
  }}
  maxLength={MAX_NAME_LENGTH}
  required
/>
```

### Phase 4: File Upload Security

#### 4.1 Enhanced File Validation

**File:** `src/utils/fileValidation.ts`

**Features:**
- Magic number validation (verify actual file type, not just extension)
- File size limits (already exists, but document)
- Filename sanitization
- Content scanning for malicious patterns

**Implementation:**
```typescript
import { sanitizeFilename } from './sanitize';

const IMAGE_MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
};

export async function validateImageFile(file: File): Promise<boolean> {
  // Check MIME type
  if (!file.type.startsWith('image/')) return false;
  
  // Verify magic numbers
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 4));
  const magic = Array.from(bytes);
  
  const expectedMagic = IMAGE_MAGIC_NUMBERS[file.type as keyof typeof IMAGE_MAGIC_NUMBERS];
  if (!expectedMagic) return false;
  
  return expectedMagic.every((byte, i) => magic[i] === byte);
}
```

### Phase 5: Output Encoding

#### 5.1 React Component Rendering

**Files:** All components that display user-generated content

**Changes needed:**
- Use React's built-in XSS protection (already in place)
- For dangerouslySetInnerHTML (if used), ensure content is sanitized first
- Encode special characters in URLs

**Note:** React automatically escapes content in JSX, but we should still sanitize at input to prevent issues if content is used elsewhere.

### Phase 6: Additional Security Measures

#### 6.1 Content Security Policy (CSP)
Add CSP headers to prevent XSS attacks even if sanitization fails.

**File:** `astro.config.mjs` or middleware

```javascript
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
}
```

#### 6.2 Rate Limiting
Implement rate limiting on API endpoints to prevent abuse.

#### 6.3 Input Logging
Log suspicious input patterns (optional, for monitoring).

## Implementation Priority

### High Priority (Immediate)
1. ✅ Create sanitization utilities (`sanitize.ts`)
2. ✅ Create validation schemas (`validation.ts`)
3. ✅ Apply sanitization to Events API
4. ✅ Apply sanitization to Event Types API
5. ✅ Validate route parameters (UUID format)

### Medium Priority (Next Sprint)
6. ✅ Apply sanitization to Photos API
7. ✅ Enhanced file validation
8. ✅ Client-side input limits
9. ✅ Auth endpoint validation improvements

### Low Priority (Future)
10. Content Security Policy headers
11. Rate limiting
12. Input pattern monitoring

## Testing Strategy

### Unit Tests
- Test sanitization functions with various attack payloads
- Test validation schemas with valid and invalid inputs
- Test file validation with malicious files

### Integration Tests
- Test API endpoints with malicious inputs
- Verify sanitized data is stored correctly
- Verify sanitized data displays safely

### Security Testing
- XSS payload testing
- Path traversal attempts
- SQL injection attempts (should all fail)
- File upload attacks

## Example Attack Payloads for Testing

### XSS Payloads
```javascript
"<script>alert('XSS')</script>"
"<img src=x onerror=alert('XSS')>"
"javascript:alert('XSS')"
"<svg onload=alert('XSS')>"
"<iframe src=javascript:alert('XSS')>"
"<body onload=alert('XSS')>"
```

### Path Traversal Payloads
```javascript
"../../../etc/passwd"
"..\\..\\..\\windows\\system32"
"%2e%2e%2f%2e%2e%2f%2e%2e%2f"
```

### SQL Injection Payloads (should all be handled by Supabase)
```javascript
"'; DROP TABLE events; --"
"1' OR '1'='1"
"admin'--"
```

## Monitoring & Maintenance

1. **Regular Updates**: Keep sanitization libraries updated
2. **Security Audits**: Regular code reviews for new input points
3. **Vulnerability Scanning**: Use tools like Snyk or npm audit
4. **Logging**: Monitor for suspicious input patterns
5. **Documentation**: Keep this plan updated as new features are added

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Zod Documentation](https://zod.dev/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

