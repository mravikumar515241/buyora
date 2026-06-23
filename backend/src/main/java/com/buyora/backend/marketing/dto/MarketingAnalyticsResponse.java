package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarketingAnalyticsResponse {
    private long totalBanners;
    private long activeBanners;
    private long totalCampaigns;
    private long activeCampaigns;
    private long totalCoupons;
    private long couponRedemptions;
    private long pendingVendorPromotions;
    private long totalFlashSales;
}
