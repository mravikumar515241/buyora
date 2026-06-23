package com.buyora.backend.notification.service;

import com.buyora.backend.notification.entity.*;
import com.buyora.backend.notification.repository.NotificationPreferenceRepository;
import com.buyora.backend.notification.repository.NotificationRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationDispatcher {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @Transactional
    public void send(Long userId, String title, String message, NotificationCategory category,
                     NotificationEventType eventType, NotificationPriority priority, String actionUrl) {
        send(userId, title, message, category, eventType, priority, actionUrl, null);
    }

    @Transactional
    public void send(Long userId, String title, String message, NotificationCategory category,
                     NotificationEventType eventType, NotificationPriority priority,
                     String actionUrl, Long announcementId) {
        if (!isAllowed(userId, category)) return;

        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setCategory(category);
        n.setEventType(eventType);
        n.setPriority(priority != null ? priority : NotificationPriority.MEDIUM);
        n.setActionUrl(actionUrl);
        n.setAnnouncementId(announcementId);
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyRole(String roleName, String title, String message, NotificationCategory category,
                           NotificationEventType eventType, NotificationPriority priority, String actionUrl) {
        for (User user : userRepository.findByRoleName(roleName)) {
            send(user.getId(), title, message, category, eventType, priority, actionUrl);
        }
    }

    @Transactional
    public void notifyAdmins(String title, String message, NotificationEventType eventType,
                             NotificationPriority priority, String actionUrl) {
        notifyRole("ADMIN", title, message, NotificationCategory.SYSTEM, eventType, priority, actionUrl);
    }

    @Transactional
    public void orderCreated(Long userId, Long orderId, String orderNumber) {
        send(userId,
                "Order Placed",
                "Your order #" + orderNumber + " has been placed successfully.",
                NotificationCategory.ORDER,
                NotificationEventType.ORDER_CREATED,
                NotificationPriority.MEDIUM,
                "/orders/" + orderId);
    }

    @Transactional
    public void paymentSuccessful(Long userId, Long orderId, String orderNumber) {
        send(userId,
                "Payment Successful",
                "Payment for order #" + orderNumber + " was successful.",
                NotificationCategory.PAYMENT,
                NotificationEventType.PAYMENT_SUCCESSFUL,
                NotificationPriority.MEDIUM,
                "/orders/" + orderId);
    }

    @Transactional
    public void paymentFailed(Long userId, Long orderId, String orderNumber) {
        send(userId,
                "Payment Failed",
                "Payment for order #" + orderNumber + " could not be processed. Please try again.",
                NotificationCategory.PAYMENT,
                NotificationEventType.PAYMENT_FAILED,
                NotificationPriority.HIGH,
                "/orders/" + orderId);
    }

    @Transactional
    public void newLogin(Long userId) {
        send(userId,
                "New Login",
                "Your account was signed in successfully.",
                NotificationCategory.SECURITY,
                NotificationEventType.NEW_LOGIN,
                NotificationPriority.LOW,
                "/settings/notifications");
    }

    @Transactional
    public void vendorApproved(Long userId) {
        send(userId,
                "Vendor Approved",
                "Your vendor account has been approved. You can now list products.",
                NotificationCategory.VENDOR,
                NotificationEventType.VENDOR_APPROVED,
                NotificationPriority.HIGH,
                "/dashboard");
    }

    @Transactional
    public void vendorRejected(Long userId) {
        send(userId,
                "Vendor Application Update",
                "Your vendor application was not approved. Contact support for details.",
                NotificationCategory.VENDOR,
                NotificationEventType.VENDOR_REJECTED,
                NotificationPriority.HIGH,
                "/profile");
    }

    @Transactional
    public void newVendorRegistration(Long vendorId, String businessName) {
        notifyAdmins(
                "New Vendor Registration",
                businessName + " has registered and awaits approval.",
                NotificationEventType.NEW_VENDOR_REGISTRATION,
                NotificationPriority.MEDIUM,
                "/admin/vendors");
    }

    @Transactional
    public void dispatchAnnouncement(PlatformAnnouncement announcement) {
        Set<Long> userIds = resolveAudience(announcement);
        for (Long userId : userIds) {
            send(userId,
                    announcement.getTitle(),
                    announcement.getDescription() != null ? announcement.getDescription() : announcement.getTitle(),
                    NotificationCategory.ANNOUNCEMENT,
                    NotificationEventType.PLATFORM_ANNOUNCEMENT,
                    announcement.getPriority(),
                    "/notifications",
                    announcement.getId());
        }
    }

    private Set<Long> resolveAudience(PlatformAnnouncement announcement) {
        Set<Long> ids = new HashSet<>();
        switch (announcement.getAudience()) {
            case ALL_USERS -> userRepository.findAll().forEach(u -> ids.add(u.getId()));
            case CUSTOMERS_ONLY -> userRepository.findByRoleName("CUSTOMER").forEach(u -> ids.add(u.getId()));
            case VENDORS_ONLY -> userRepository.findByRoleName("VENDOR").forEach(u -> ids.add(u.getId()));
            case ADMINS_ONLY -> userRepository.findByRoleName("ADMIN").forEach(u -> ids.add(u.getId()));
            case SPECIFIC_USER -> {
                if (announcement.getTargetUserId() != null) ids.add(announcement.getTargetUserId());
            }
            case SPECIFIC_VENDOR -> {
                if (announcement.getTargetVendorId() != null) {
                    vendorRepository.findById(announcement.getTargetVendorId())
                            .map(v -> v.getUser().getId())
                            .ifPresent(ids::add);
                }
            }
        }
        return ids;
    }

    private boolean isAllowed(Long userId, NotificationCategory category) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> defaultPreference(userId));
        return switch (category) {
            case ORDER -> pref.isOrderNotifications();
            case PAYMENT -> pref.isPaymentNotifications();
            case PROMOTION -> pref.isPromotionalNotifications();
            case SECURITY -> pref.isSecurityNotifications();
            case ANNOUNCEMENT -> pref.isAnnouncementNotifications();
            default -> true;
        };
    }

    private NotificationPreference defaultPreference(Long userId) {
        NotificationPreference p = new NotificationPreference();
        p.setUserId(userId);
        return p;
    }
}
