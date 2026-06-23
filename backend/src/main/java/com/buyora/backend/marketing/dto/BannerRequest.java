package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.MarketingBanner;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BannerRequest {
    private String title;
    private String subtitle;
    private String description;
    private String imageUrl;
    private String mobileImageUrl;
    private String gradient;
    private String buttonText;
    private String buttonLink;
    private String badge;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer priority;
    private Boolean active;
    private MarketingBanner.DisplayLocation displayLocation;
}
