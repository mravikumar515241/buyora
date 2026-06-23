package com.buyora.backend.review.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReviewAnalyticsResponse {
    private List<ReviewAnalyticsItem> topRatedProducts;
    private List<ReviewAnalyticsItem> worstRatedProducts;
    private List<ReviewAnalyticsItem> topRatedVendors;
    private List<ReviewAnalyticsItem> mostReviewedProducts;
}
