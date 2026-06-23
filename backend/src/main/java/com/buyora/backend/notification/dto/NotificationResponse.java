package com.buyora.backend.notification.dto;

import com.buyora.backend.notification.entity.NotificationCategory;
import com.buyora.backend.notification.entity.NotificationEventType;
import com.buyora.backend.notification.entity.NotificationPriority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationCategory category;
    private NotificationEventType eventType;
    private NotificationPriority priority;
    private String actionUrl;
    private boolean read;
    private LocalDateTime createdAt;
}
