package com.buyora.backend.wishlist.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SavedItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String vendorName;
    private String imageUrl;
    private BigDecimal currentPrice;
    private BigDecimal priceAtSave;
    private String stockStatus;
    private Integer availableQuantity;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime savedAt;
}
