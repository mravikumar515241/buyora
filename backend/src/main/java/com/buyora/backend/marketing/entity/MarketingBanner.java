package com.buyora.backend.marketing.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_banners")
@Getter
@Setter
public class MarketingBanner extends BaseEntity {

    @Column(nullable = false)
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

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisplayLocation displayLocation = DisplayLocation.HERO;

    public enum DisplayLocation {
        HERO, FLASH_SALE, CATEGORY, FESTIVAL, FOOTER, DEALS_GRID
    }
}
