package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminInventoryListItemResponse {
    private Long productId;
    private String productName;
    private String sku;
    private String vendorName;
    private Long vendorId;
    private Integer stockQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer soldQuantity;
    private String stockStatus;
    private BigDecimal price;
    private String imageUrl;
}
