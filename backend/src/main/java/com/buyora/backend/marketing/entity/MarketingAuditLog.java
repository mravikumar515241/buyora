package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "marketing_audit_logs")
@Getter
@Setter
public class MarketingAuditLog extends BaseEntity {

    @Column(nullable = false)
    private String entityType;

    private Long entityId;

    @Column(nullable = false)
    private String action;

    private Long performedByUserId;
    private String performedByEmail;
    private String details;
}
