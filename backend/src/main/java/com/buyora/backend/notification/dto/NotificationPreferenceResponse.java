package com.buyora.backend.notification.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationPreferenceResponse {
    private boolean orderNotifications;
    private boolean paymentNotifications;
    private boolean promotionalNotifications;
    private boolean securityNotifications;
    private boolean announcementNotifications;
    private boolean emailNotifications;
    private boolean browserNotifications;
    private boolean pushNotifications;
}
