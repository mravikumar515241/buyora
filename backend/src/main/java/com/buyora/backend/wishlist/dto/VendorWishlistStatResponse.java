package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorWishlistStatResponse {
    private Long productId;
    private String productName;
    private Long wishlistCount;
}
