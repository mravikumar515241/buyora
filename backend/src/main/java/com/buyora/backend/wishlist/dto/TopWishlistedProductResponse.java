package com.buyora.backend.wishlist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopWishlistedProductResponse {
    private Long productId;
    private String productName;
    private Long wishlistCount;
}
