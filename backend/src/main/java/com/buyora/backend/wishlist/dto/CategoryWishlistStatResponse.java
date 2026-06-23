package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryWishlistStatResponse {
    private Long categoryId;
    private String categoryName;
    private long wishlistCount;
}
