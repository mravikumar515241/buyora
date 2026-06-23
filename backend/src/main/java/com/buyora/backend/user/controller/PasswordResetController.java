package com.buyora.backend.user.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.user.dto.ForgotPasswordRequest;
import com.buyora.backend.user.dto.ResetPasswordRequest;
import com.buyora.backend.user.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for password reset operations.
 * 
 * PRODUCTION CONSIDERATIONS:
 * 
 * TODO: SECURITY - Rate Limiting
 * Add rate limiting annotation/interceptor to prevent brute force attacks:
 * - @RateLimit(maxRequests = 5, window = "1h") on /forgot endpoint
 * - @RateLimit(maxRequests = 10, window = "1h") on /reset endpoint
 * 
 * TODO: SECURITY - CAPTCHA Integration
 * Add CAPTCHA verification to /forgot endpoint:
 * - Google reCAPTCHA v3 or hCaptcha
 * - Validate token on backend before processing
 * 
 * TODO: MONITORING - Request Logging
 * Add detailed logging with:
 * - User IP address (use X-Forwarded-For header)
 * - User Agent
 * - Timestamp
 * - Success/failure status
 * 
 * TODO: PRODUCTION - API Documentation
 * Add Swagger/OpenAPI annotations for API documentation
 */
@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Initiates the forgot password flow.
     * 
     * TODO: PRODUCTION - Add CAPTCHA validation
     * @RequestBody should include captchaToken field
     * Validate with: captchaService.validate(request.getCaptchaToken())
     * 
     * TODO: PRODUCTION - Log IP address and user agent
     * Use: @RequestHeader("X-Forwarded-For") String ip
     * 
     * @param request The forgot password request with email
     * @return Success response (always returns success for security)
     */
    @PostMapping("/forgot")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // TODO: PRODUCTION - Add CAPTCHA validation here
        // if (!captchaService.validate(request.getCaptchaToken())) {
        //     return ResponseEntity.badRequest().body(ApiResponse.error("Invalid CAPTCHA"));
        // }
        
        // TODO: PRODUCTION - Log request with IP for monitoring
        // log.info("Password reset requested for email: {} from IP: {}", request.getEmail(), ip);
        
        passwordResetService.initiateForgotPassword(request.getEmail());
        
        // Always return success for security (don't reveal if email exists)
        return ResponseEntity.ok(ApiResponse.success(
            "If your email is registered, you will receive a password reset link shortly",
            null
        ));
    }

    /**
     * Validates a password reset token.
     * 
     * TODO: PRODUCTION - Consider removing this endpoint
     * Exposing token validation allows attackers to test stolen tokens.
     * Instead, validate token only during actual reset attempt.
     * 
     * @param token The reset token to validate
     * @return Validation result
     */
    @GetMapping("/validate-token")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        // TODO: PRODUCTION - Add rate limiting here
        // TODO: PRODUCTION - Log validation attempts for monitoring
        
        boolean isValid = passwordResetService.validateToken(token);
        
        return ResponseEntity.ok(ApiResponse.success(
            isValid ? "Token is valid" : "Token is invalid or expired",
            isValid
        ));
    }

    /**
     * Resets the user's password using a valid token.
     * 
     * TODO: PRODUCTION - Enhanced logging
     * Log successful and failed attempts with user ID
     * 
     * TODO: PRODUCTION - Additional validation
     * - Check password strength on backend (not just frontend)
     * - Validate against common password lists
     * 
     * @param request The reset password request with token and new password
     * @return Success or error response
     */
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // TODO: PRODUCTION - Add additional password validation
            // validatePasswordStrength(request.getNewPassword());
            
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            
            // TODO: PRODUCTION - Log successful reset with user ID
            // log.info("Password reset successful for user ID: {}", userId);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Password reset successfully",
                null
            ));
        } catch (IllegalArgumentException e) {
            // TODO: PRODUCTION - Log failed attempts for monitoring
            // log.warn("Password reset failed: {} for token: {}", e.getMessage(), request.getToken());
            
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
