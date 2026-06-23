package com.buyora.backend.review.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductReviewSummaryResponse {
    private Double averageRating;
    private long totalReviews;
    private List<RatingBreakdownItem> breakdown;
    private List<String> recentReviewImages;
}
