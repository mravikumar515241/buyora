package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VendorInventoryDashboardResponse {
    private long totalProducts;
    private long productsInStock;
    private long lowStockProducts;
    private long outOfStockProducts;
    private long totalInventoryUnits;
    private BigDecimal inventoryValue;
    private long unreadNotifications;
}
