package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.MarketingCampaign;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CampaignResponse {
    private Long id;
    private String name;
    private String description;
    private MarketingCampaign.CampaignType campaignType;
    private MarketingCampaign.CampaignStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long bannerId;
    private Long categoryId;
    private Long vendorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
