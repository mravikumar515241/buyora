package com.buyora.backend.notification.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_preferences", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Getter
@Setter
public class NotificationPreference extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    private boolean orderNotifications = true;
    private boolean paymentNotifications = true;
    private boolean promotionalNotifications = true;
    private boolean securityNotifications = true;
    private boolean announcementNotifications = true;
    private boolean emailNotifications = true;
    private boolean browserNotifications = true;
    private boolean pushNotifications = false;
}
