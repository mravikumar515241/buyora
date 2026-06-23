package com.buyora.backend.marketing.dto;

import com.buyora.backend.marketing.entity.MarketingBanner;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BannerResponse {
    private Long id;
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
    private boolean active;
    private MarketingBanner.DisplayLocation displayLocation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
