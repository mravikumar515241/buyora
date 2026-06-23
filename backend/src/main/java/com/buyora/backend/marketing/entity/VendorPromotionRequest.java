package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_promotion_requests")
@Getter
@Setter
public class VendorPromotionRequest extends BaseEntity {

    @Column(nullable = false)
    private Long vendorId;

    @Column(nullable = false)
    private String title;

    private String description;

    private BigDecimal discountPercent;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private String adminNotes;

    public enum RequestStatus {
        PENDING, APPROVED, REJECTED, PAUSED, REMOVED
    }
}
