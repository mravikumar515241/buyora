package com.buyora.backend.notification.dto;

import com.buyora.backend.notification.entity.AnnouncementAudience;
import com.buyora.backend.notification.entity.NotificationPriority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PlatformAnnouncementRequest {
    private String title;
    private String description;
    private String bannerImageUrl;
    private NotificationPriority priority;
    private AnnouncementAudience audience;
    private Long targetUserId;
    private Long targetVendorId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
}
