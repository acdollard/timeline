# Authentication Flow Analysis: Email Confirmation Loop Issue

## Problem Summary
Users are getting caught in a loop when creating an account. The email from Supabase is routing them to the "change your password" form instead of confirming their email and allowing them to sign in.

## Quick Fix: Supabase Dashboard Settings

**⚠️ CRITICAL: Change the default Site URL from `/forgot-password` to `/` (root)**

**In Supabase Dashboard:**
1. Go to **Settings** → **Authentication** → **URL Configuration**
2. **Site URL**: Change from `https://yourdomain.com/forgot-password` to `https://yourdomain.com/`
3. **Redirect URLs**: Add all allowed redirect URLs (see Solution 3 below)

**Why this matters:**
- The Site URL is the **default fallback** when no specific `redirectTo` is provided
- Setting it to `/forgot-password` causes ALL email links (including confirmations) to go there
- This is why users are seeing the password reset form instead of email confirmation

## Current Authentication Flow

### 1. Registration Flow (`/api/auth/register.ts`)

**What happens:**
1. User submits email and password on `/register` page
2. Form POSTs to `/api/auth/register`
3. Backend calls `supabase.auth.signUp({ email, password })`
4. **Critical Issue**: No `redirectTo` URL is specified for email confirmation
5. On success, user is redirected to `/signin?message=check_email`

**Code:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  // ❌ MISSING: options: { emailRedirectTo: '...' }
});
```

**What Supabase does:**
- Creates user account (but user is NOT confirmed)
- Sends email confirmation email (if email confirmation is enabled in Supabase dashboard)
- Email contains a link with tokens in the hash fragment: `#access_token=...&refresh_token=...&type=signup`
- **Problem**: The link goes to the default Supabase redirect URL (likely your site root or a misconfigured URL)

### 2. Email Confirmation Flow (MISSING/INCORRECT)

**What SHOULD happen:**
1. User clicks link in confirmation email
2. Link should go to a dedicated confirmation page (e.g., `/confirm-email`)
3. Page extracts tokens from hash fragment
4. Sets session using tokens
5. Redirects to sign-in or dashboard

**What ACTUALLY happens:**
1. User clicks link in confirmation email
2. Link goes to `/forgot-password` (or root, which might redirect)
3. The `forgot-password.astro` page has scripts that detect ANY hash tokens
4. Scripts automatically redirect to `/reset-password`
5. User sees password reset form instead of confirmation success

**The problematic code in `forgot-password.astro`:**
```javascript
// This script runs on EVERY page load and catches ALL hash tokens
<script>
  if (window.location.hash && window.location.hash.includes('access_token')) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // ❌ PROBLEM: Redirects ALL hash tokens to reset-password
      // This includes email confirmation tokens!
      window.location.href = '/reset-password?access_token=...&refresh_token=...';
    }
  }
</script>
```

### 3. Sign-In Flow (`/api/auth/signin.ts`)

**What happens:**
1. User submits email and password
2. Backend calls `supabase.auth.signInWithPassword()`
3. If email not confirmed, returns error: "Email not confirmed"
4. User sees error message but can't confirm email easily

**Code:**
```typescript
case "Email not confirmed":
  return redirect("/signin?error=email_not_confirmed");
```

### 4. Forgot Password Flow (`/api/auth/forgot-password.ts`)

**What happens:**
1. User requests password reset
2. Backend calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })`
3. Supabase sends email with reset link
4. Link contains tokens in hash fragment
5. `forgot-password.astro` catches the tokens and redirects to `/reset-password`

**This flow works correctly** - the issue is that the same token-catching logic is also catching email confirmation tokens.

### 5. Reset Password Flow (`/api/auth/reset-password.ts`)

**What happens:**
1. User lands on `/reset-password` with tokens in query params
2. Page sets session using tokens
3. User submits new password
4. Backend updates password and redirects to sign-in

**This flow works correctly** for password resets, but users are being incorrectly routed here from email confirmation.

## Root Causes

### Cause 1: Missing Email Confirmation Handler
- **No dedicated page** for handling email confirmation (`/confirm-email` or similar)
- **No API endpoint** to process email confirmation
- Registration doesn't specify where to redirect after email confirmation

### Cause 2: Token Interception in Wrong Place
- `forgot-password.astro` has scripts that catch **ALL** hash tokens
- These scripts don't distinguish between:
  - Email confirmation tokens (`type=signup`)
  - Password reset tokens (`type=recovery`)
- All tokens get routed to `/reset-password`
+
### Cause 3: No `emailRedirectTo` in Registration
- When calling `supabase.auth.signUp()`, no `emailRedirectTo` option is provided
- Supabase uses default redirect (which might be misconfigured)
- Confirmation emails don't know where to send users

### Cause 4: Supabase Configuration
- In Supabase dashboard, email templates might be configured incorrectly
- The "Confirm signup" email template might be pointing to the wrong URL
- Or password reset and confirmation emails might be using the same redirect URL

## The Loop Explained

1. **User registers** → Account created, email sent
2. **User clicks email link** → Goes to `/forgot-password` (or root)
3. **Hash tokens detected** → Script redirects to `/reset-password`
4. **User sees password reset form** → Thinks they need to reset password
5. **User sets new password** → Password updated, redirected to sign-in
6. **User tries to sign in** → Might work, but email still not "confirmed" in Supabase's eyes
7. **OR**: User clicks email link again → Loop repeats

## Current File Structure

```
src/pages/
├── register.astro              # Registration form
├── signin.astro               # Sign-in form
├── forgot-password.astro       # Request password reset (❌ catches all hash tokens)
├── reset-password.astro        # Reset password form
└── api/auth/
    ├── register.ts             # Registration endpoint (❌ no emailRedirectTo)
    ├── signin.ts               # Sign-in endpoint
    ├── forgot-password.ts      # Request reset endpoint
    └── reset-password.ts       # Update password endpoint
```

**Missing:**
- `confirm-email.astro` - Page to handle email confirmation
- `/api/auth/confirm-email.ts` - Endpoint to process confirmation (optional, can be done client-side)

## Supabase Email Types

Supabase sends different types of emails with different token types:

1. **Email Confirmation** (`type=signup`)
   - Sent when user registers
   - Contains: `access_token`, `refresh_token`, `type=signup`
   - Should confirm email and auto-sign-in user

2. **Password Reset** (`type=recovery`)
   - Sent when user requests password reset
   - Contains: `access_token`, `refresh_token`, `type=recovery`
   - Should allow user to set new password

3. **Magic Link** (`type=magiclink`)
   - Sent for passwordless authentication
   - Contains: `access_token`, `refresh_token`, `type=magiclink`

## How to Fix

### Solution 1: Add Email Confirmation Handler (Recommended)

1. **Create `/confirm-email.astro` page:**
   - Extract tokens from hash fragment
   - Check `type` parameter to distinguish confirmation from reset
   - If `type=signup`: Set session, confirm email, redirect to dashboard
   - If `type=recovery`: Redirect to `/reset-password`

2. **Update registration endpoint:**
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       emailRedirectTo: `${new URL(request.url).origin}/confirm-email`
     }
   });
   ```

3. **Update forgot-password.astro:**
   - Only redirect to `/reset-password` if `type=recovery`
   - If `type=signup`, redirect to `/confirm-email`

### Solution 2: Fix Token Detection Logic

Update the scripts in `forgot-password.astro` to check the `type` parameter:

```javascript
<script>
  if (window.location.hash && window.location.hash.includes('access_token')) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken && refreshToken) {
      if (type === 'recovery') {
        // Password reset - go to reset-password
        window.location.href = '/reset-password?access_token=...&refresh_token=...';
      } else if (type === 'signup') {
        // Email confirmation - go to confirm-email
        window.location.href = '/confirm-email?access_token=...&refresh_token=...';
      }
    }
  }
</script>
```

### Solution 3: Configure Supabase Dashboard

**Site URL (Default Redirect):**
- Set to: `https://yourdomain.com/` (root) - **NOT `/forgot-password`**
- This is the fallback URL when no specific `redirectTo` is provided
- Should be a neutral landing page

**Redirect URLs (Allowed URLs):**
Add these to your allowed redirect URLs list:
- `https://yourdomain.com/`
- `https://yourdomain.com/confirm-email`
- `https://yourdomain.com/reset-password`
- `http://localhost:4321/` (for local development)
- `http://localhost:4321/confirm-email`
- `http://localhost:4321/reset-password`

**Email Templates:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Check "Confirm signup" template
3. The redirect URL in the template will use either:
   - The `emailRedirectTo` specified in code (preferred)
   - Or fall back to the Site URL if not specified
4. Verify "Reset password" template - it should use the `redirectTo` from `resetPasswordForEmail()` call

## Recommended Implementation

1. **Create email confirmation page** that:
   - Handles `type=signup` tokens
   - Sets session automatically
   - Shows success message
   - Redirects to dashboard

2. **Update registration** to specify `emailRedirectTo`

3. **Fix token detection** to route based on `type` parameter

4. **Add confirmation success message** on sign-in page

This will break the loop and provide a clear path for new users to confirm their email and sign in.

