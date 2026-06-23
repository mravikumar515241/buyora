package com.buyora.backend.notification.dto;

import com.buyora.backend.notification.entity.NotificationPriority;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnreadCountResponse {
    private long count;
    private NotificationPriority highestPriority;
}
