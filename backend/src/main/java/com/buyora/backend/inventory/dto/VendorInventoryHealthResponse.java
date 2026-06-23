package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorInventoryHealthResponse {
    private Long vendorId;
    private String vendorName;
    private long totalProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
}
