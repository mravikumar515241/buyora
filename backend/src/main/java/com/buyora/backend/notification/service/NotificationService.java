package com.buyora.backend.notification.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.notification.dto.*;
import com.buyora.backend.notification.entity.*;
import com.buyora.backend.notification.repository.NotificationPreferenceRepository;
import com.buyora.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(Long userId, Boolean read, NotificationCategory category,
                                           String search, Pageable pageable) {
        return notificationRepository.searchNotifications(userId, read, category, search, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> recent(Long userId, int limit) {
        return notificationRepository.findTop10ByUserIdAndDeletedFalseAndEnabledTrueOrderByCreatedAtDesc(userId)
                .stream().limit(limit).map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndReadFalseAndDeletedFalseAndEnabledTrue(userId);
        NotificationPriority highest = notificationRepository
                .findTop10ByUserIdAndDeletedFalseAndEnabledTrueOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead())
                .map(Notification::getPriority)
                .max(Comparator.comparingInt(NotificationService::priorityWeight))
                .orElse(null);
        return UnreadCountResponse.builder().count(count).highestPriority(highest).build();
    }

    @Transactional
    public void markRead(Long userId, Long notificationId) {
        Notification n = getOwned(userId, notificationId);
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    @Transactional
    public void delete(Long userId, Long notificationId) {
        Notification n = getOwned(userId, notificationId);
        n.setDeleted(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void clearAll(Long userId) {
        notificationRepository.softDeleteAll(userId);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .map(this::toPreferenceResponse)
                .orElseGet(() -> toPreferenceResponse(defaultPreferences(userId)));
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceRequest request) {
        NotificationPreference pref = getOrCreatePreferences(userId);
        if (request.getOrderNotifications() != null) pref.setOrderNotifications(request.getOrderNotifications());
        if (request.getPaymentNotifications() != null) pref.setPaymentNotifications(request.getPaymentNotifications());
        if (request.getPromotionalNotifications() != null) pref.setPromotionalNotifications(request.getPromotionalNotifications());
        if (request.getSecurityNotifications() != null) pref.setSecurityNotifications(request.getSecurityNotifications());
        if (request.getAnnouncementNotifications() != null) pref.setAnnouncementNotifications(request.getAnnouncementNotifications());
        if (request.getEmailNotifications() != null) pref.setEmailNotifications(request.getEmailNotifications());
        if (request.getBrowserNotifications() != null) pref.setBrowserNotifications(request.getBrowserNotifications());
        if (request.getPushNotifications() != null) pref.setPushNotifications(request.getPushNotifications());
        return toPreferenceResponse(preferenceRepository.save(pref));
    }

    private Notification getOwned(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!n.getUserId().equals(userId) || n.isDeleted()) {
            throw new IllegalArgumentException("Not your notification");
        }
        return n;
    }

    private NotificationPreference getOrCreatePreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> preferenceRepository.save(defaultPreferences(userId)));
    }

    private NotificationPreference defaultPreferences(Long userId) {
        NotificationPreference p = new NotificationPreference();
        p.setUserId(userId);
        return p;
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .eventType(n.getEventType())
                .priority(n.getPriority())
                .actionUrl(n.getActionUrl())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private NotificationPreferenceResponse toPreferenceResponse(NotificationPreference p) {
        return NotificationPreferenceResponse.builder()
                .orderNotifications(p.isOrderNotifications())
                .paymentNotifications(p.isPaymentNotifications())
                .promotionalNotifications(p.isPromotionalNotifications())
                .securityNotifications(p.isSecurityNotifications())
                .announcementNotifications(p.isAnnouncementNotifications())
                .emailNotifications(p.isEmailNotifications())
                .browserNotifications(p.isBrowserNotifications())
                .pushNotifications(p.isPushNotifications())
                .build();
    }

    private static int priorityWeight(NotificationPriority p) {
        return switch (p) {
            case CRITICAL -> 4;
            case HIGH -> 3;
            case MEDIUM -> 2;
            default -> 1;
        };
    }
}
