package com.buyora.backend.notification.dto;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {
    private Boolean orderNotifications;
    private Boolean paymentNotifications;
    private Boolean promotionalNotifications;
    private Boolean securityNotifications;
    private Boolean announcementNotifications;
    private Boolean emailNotifications;
    private Boolean browserNotifications;
    private Boolean pushNotifications;
}
