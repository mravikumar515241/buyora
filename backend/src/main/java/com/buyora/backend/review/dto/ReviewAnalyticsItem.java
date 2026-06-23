package com.buyora.backend.review.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewAnalyticsItem {
    private Long id;
    private String name;
    private Double averageRating;
    private Long reviewCount;
}
