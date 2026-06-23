package com.buyora.backend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${spring.application.name:Buyora}")
    private String appName;

    /**
     * Sends a password reset email to the user.
     * 
     * TODO: PRODUCTION - Email Integration Required
     * This method currently logs emails to console for development.
     * Before production deployment:
     * 1. Choose an email service provider (SendGrid, AWS SES, Mailgun, etc.)
     * 2. Add the required dependency to pom.xml
     * 3. Configure email credentials in application.yml or environment variables
     * 4. Uncomment and implement the actual email sending logic below
     * 
     * Example with Spring Mail (JavaMailSender):
     * - Add dependency: spring-boot-starter-mail
     * - Configure: spring.mail.host, username, password
     * - Inject: @Autowired private JavaMailSender mailSender
     * - Uncomment the MimeMessage code below
     * 
     * @param toEmail The recipient email address
     * @param userName The user's full name
     * @param resetLink The password reset link with token
     * @param expiryMinutes Token expiry duration in minutes
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink, int expiryMinutes) {
        // In production, integrate with email service (AWS SES, SendGrid, etc.)
        // For now, we'll log the email content
        
        String subject = "Reset Your Password - " + appName;
        String body = buildPasswordResetEmailBody(userName, resetLink, expiryMinutes);
        
        log.info("===== PASSWORD RESET EMAIL =====");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("================================");
        
        // TODO: PRODUCTION - Uncomment and configure email sending
        // Example with JavaMailSender:
        // try {
        //     MimeMessage message = mailSender.createMimeMessage();
        //     MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        //     helper.setTo(toEmail);
        //     helper.setSubject(subject);
        //     helper.setText(body, true); // true = HTML content
        //     helper.setFrom("noreply@buyora.com"); // Set your from address
        //     mailSender.send(message);
        //     log.info("Password reset email sent successfully to: {}", toEmail);
        // } catch (MessagingException e) {
        //     log.error("Failed to send password reset email to: {}", toEmail, e);
        //     throw new RuntimeException("Failed to send email", e);
        // }
    }

    private String buildPasswordResetEmailBody(String userName, String resetLink, int expiryMinutes) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Reset Your Password</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>We received a request to reset your password for your %s account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">%s</p>
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This link will expire in <strong>%d minutes</strong></li>
                                <li>This link can only be used once</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        <p>For security reasons, we recommend choosing a strong password that:</p>
                        <ul>
                            <li>Is at least 8 characters long</li>
                            <li>Contains uppercase and lowercase letters</li>
                            <li>Includes numbers and special characters</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>© 2026 %s. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName, appName, resetLink, resetLink, expiryMinutes, appName);
    }

    public void sendPasswordChangedNotification(String toEmail, String userName) {
        String subject = "Password Changed Successfully - " + appName;
        String body = buildPasswordChangedEmailBody(userName);
        
        log.info("===== PASSWORD CHANGED EMAIL =====");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("==================================");
    }

    private String buildPasswordChangedEmailBody(String userName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Password Changed</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <div class="success">
                            <strong>Your password has been changed successfully!</strong>
                        </div>
                        <p>If you made this change, you can safely ignore this email.</p>
                        <p>If you did NOT make this change, please contact our support team immediately.</p>
                        <p><strong>Security Tips:</strong></p>
                        <ul>
                            <li>Never share your password with anyone</li>
                            <li>Use a unique password for each account</li>
                            <li>Enable two-factor authentication when available</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>© 2026 %s. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName, appName);
    }
}
