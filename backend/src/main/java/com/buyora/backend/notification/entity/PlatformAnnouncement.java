package com.buyora.backend.notification.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "platform_announcements")
@Getter
@Setter
public class PlatformAnnouncement extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    private String bannerImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementAudience audience;

    private Long targetUserId;
    private Long targetVendorId;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Column(nullable = false)
    private boolean active = true;

    private boolean dispatched = false;
}
