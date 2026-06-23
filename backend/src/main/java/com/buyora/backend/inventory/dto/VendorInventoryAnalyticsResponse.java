package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VendorInventoryAnalyticsResponse {
    private List<TopSellingProductResponse> mostSoldProducts;
    private List<TopSellingProductResponse> leastSoldProducts;
    private List<TopSellingProductResponse> fastMovingProducts;
    private List<TopSellingProductResponse> slowMovingProducts;
    private BigDecimal stockValue;
    private long totalInventoryUnits;
}
