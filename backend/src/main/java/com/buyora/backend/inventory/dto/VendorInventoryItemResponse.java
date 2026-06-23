package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VendorInventoryItemResponse {
    private Long productId;
    private String productName;
    private Integer stockQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer soldQuantity;
    private String sku;
    private Integer lowStockThreshold;
    private Integer reorderThreshold;
    private String stockStatus;
    private BigDecimal price;
    private String imageUrl;
    private java.time.LocalDateTime lastUpdated;
}
