package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WishlistItemResponse {
    private Long id;
    private Long collectionId;
    private String collectionName;
    private Long productId;
    private String productName;
    private String vendorName;
    private String imageUrl;
    private BigDecimal currentPrice;
    private BigDecimal priceAtAdd;
    private Boolean priceChanged;
    private BigDecimal discountAmount;
    private Integer discountPercent;
    private String stockStatus;
    private Integer availableQuantity;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime addedAt;
}
