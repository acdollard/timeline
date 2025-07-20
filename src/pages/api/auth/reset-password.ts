import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;
    const accessToken = formData.get('access_token') as string;
    const refreshToken = formData.get('refresh_token') as string;

    // Validate required fields
    if (!password || !confirmPassword || !accessToken || !refreshToken) {
      return redirect('/reset-password?error=missing_fields');
    }

    // Validate password length
    if (password.length < 6) {
      return redirect('/reset-password?error=password_too_short');
    }

    // Validate password match
    if (password !== confirmPassword) {
      return redirect('/reset-password?error=password_mismatch');
    }

    // Set session with tokens
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !session) {
      logger.error('Session error in password reset', { error: sessionError });
      return redirect('/forgot-password?error=invalid_link');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      logger.error('Password update error', { 
        userId: session.user.id,
        error: updateError.message 
      });

      if (updateError.message.includes('weak')) {
        return redirect('/reset-password?error=weak_password');
      }

      return redirect('/reset-password?error=update_failed');
    }

    // Success - redirect to signin with success message
    return redirect('/signin?success=password_updated');

  } catch (error) {
    logger.error('Unexpected error in password reset', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return redirect('/reset-password?error=unknown');
  }
}; 