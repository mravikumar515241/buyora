package com.buyora.backend.user.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.user.entity.PasswordResetToken;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.PasswordResetTokenRepository;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling password reset functionality.
 * 
 * PRODUCTION CONSIDERATIONS:
 * 
 * TODO: SECURITY - Rate Limiting
 * - Implement rate limiting to prevent abuse (e.g., max 3 requests per email per hour)
 * - Use Redis or database to track reset attempts
 * - Block suspicious patterns (multiple emails, rapid requests)
 * 
 * TODO: SECURITY - Additional Validation
 * - Consider adding CAPTCHA to prevent automated attacks
 * - Implement IP-based rate limiting
 * - Add audit logging for all password reset attempts
 * 
 * TODO: MONITORING - Alerts & Logging
 * - Set up alerts for suspicious patterns (many failed attempts, etc.)
 * - Log all password reset events with user ID, IP, timestamp
 * - Monitor token expiry and usage statistics
 * 
 * TODO: PRODUCTION - Scheduled Cleanup
 * - Add a scheduled job to clean expired tokens periodically
 * - See PasswordResetScheduler.java (create this file)
 * 
 * TODO: PRODUCTION - Environment Configuration
 * - Set app.frontend-url to production domain in environment variables
 * - Adjust app.reset-token-expiry-minutes as needed for security policy
 * - Consider shorter expiry (5-10 minutes) for high-security applications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3001}")
    private String frontendUrl;

    @Value("${app.reset-token-expiry-minutes:15}")
    private int tokenExpiryMinutes;

    /**
     * Initiates the forgot password flow by generating a reset token and sending an email.
     * 
     * Security: Always returns success to prevent user enumeration attacks.
     * 
     * TODO: PRODUCTION - Rate Limiting
     * Add rate limiting here to prevent abuse:
     * - Check request count per email/IP in the last hour
     * - Throw RateLimitException if exceeded
     * 
     * @param email The user's email address
     */
    @Transactional
    public void initiateForgotPassword(String email) {
        // TODO: PRODUCTION - Add rate limiting check here
        // if (rateLimitService.isRateLimited(email)) {
        //     throw new RateLimitException("Too many password reset requests");
        // }
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        // For security, always return success message (don't reveal if email exists)
        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", email);
            // TODO: PRODUCTION - Log this for monitoring suspicious activity
            return;
        }

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate secure token
        String token = UUID.randomUUID().toString();
        
        // Create and save token
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        // Send email
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink, tokenExpiryMinutes);
            log.info("Password reset email sent to: {}", email);
            // TODO: PRODUCTION - Log with user ID and IP address for audit trail
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            // Don't throw exception - token is still valid
            // TODO: PRODUCTION - Alert ops team if email sending fails repeatedly
        }
    }

    /**
     * Validates if a reset token is valid, not expired, and not used.
     * 
     * @param token The reset token to validate
     * @return true if valid, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);
        
        if (resetToken == null) {
            log.warn("Token validation failed: token not found");
            return false;
        }

        if (resetToken.isUsed()) {
            log.warn("Token validation failed: token already used for user: {}", resetToken.getUser().getEmail());
            return false;
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Token validation failed: token expired for user: {}", resetToken.getUser().getEmail());
            return false;
        }

        return true;
    }

    /**
     * Resets the user's password using a valid token.
     * 
     * TODO: PRODUCTION - Password Policy
     * - Enforce stronger password requirements (min 8-12 chars, complexity)
     * - Check against common password lists
     * - Prevent password reuse (store hashed password history)
     * 
     * TODO: PRODUCTION - Notifications
     * - Send confirmation email after successful password reset
     * - Notify user if password reset wasn't initiated by them
     * 
     * @param token The reset token
     * @param newPassword The new password
     * @throws IllegalArgumentException if token is invalid, expired, or used
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset link has expired");
        }

        // TODO: PRODUCTION - Add password strength validation here
        // validatePasswordStrength(newPassword);
        
        // TODO: PRODUCTION - Check password history (prevent reuse)
        // if (passwordHistoryService.wasUsedBefore(user, newPassword)) {
        //     throw new IllegalArgumentException("Cannot reuse previous passwords");
        // }

        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());
        
        // TODO: PRODUCTION - Send password changed confirmation email
        // emailService.sendPasswordChangedNotification(user.getEmail(), user.getFullName());
        
        // TODO: PRODUCTION - Invalidate all active sessions for this user
        // sessionService.invalidateAllSessions(user.getId());
    }

    /**
     * Cleans up expired password reset tokens from the database.
     * This should be called periodically by a scheduled task.
     * 
     * TODO: PRODUCTION - Create PasswordResetScheduler
     * Create a new file: PasswordResetScheduler.java with:
     * 
     * @Component
     * public class PasswordResetScheduler {
     *     @Autowired
     *     private PasswordResetService passwordResetService;
     *     
     *     @Scheduled(cron = "0 0 * * * *") // Every hour
     *     public void cleanupExpiredTokens() {
     *         passwordResetService.cleanupExpiredTokens();
     *     }
     * }
     * 
     * Also add @EnableScheduling to your main application class.
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
