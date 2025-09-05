import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    // Validate email
    if (!email || !email.includes('@')) {
      return redirect('/forgot-password?error=invalid_email');
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    if (error) {
      logger.error('Password reset error', { 
        email,  
        error: error.message 
      });

      // Handle specific error cases
      if (error.message.includes('User not found')) {
        return redirect('/forgot-password?error=user_not_found');
      }
      if (error.message.includes('Too many requests')) {
        return redirect('/forgot-password?error=too_many_requests');
      }

      return redirect('/forgot-password?error=unknown');
    }

    // Success - redirect with success message
    return redirect('/forgot-password?success=reset_email_sent');

  } catch (error) {
    logger.error('Unexpected error in forgot password', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return redirect('/forgot-password?error=unknown');
  }
}; 