package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class WishlistAnalyticsResponse {
    private long totalWishlistItems;
    private long totalCollections;
    private long itemsAddedLast30Days;
    private long itemsAddedPrevious30Days;
    private double growthPercent;
    private List<TopWishlistedProductResponse> topProducts;
    private List<CategoryWishlistStatResponse> topCategories;
}
