package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_campaigns")
@Getter
@Setter
public class MarketingCampaign extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignType campaignType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status = CampaignStatus.DRAFT;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Long bannerId;
    private Long categoryId;
    private Long vendorId;

    public enum CampaignType {
        FLASH_SALE, FESTIVAL_SALE, SEASONAL_SALE, VENDOR_PROMOTION, CATEGORY_PROMOTION, PLATFORM_PROMOTION
    }

    public enum CampaignStatus {
        DRAFT, ACTIVE, PAUSED, ENDED
    }
}
