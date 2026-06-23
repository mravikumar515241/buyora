package com.buyora.backend.inventory.dto;

import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
public class StockThresholdRequest {
    @NotNull
    @Min(0)
    private Integer lowStockThreshold;

    @NotNull
    @Min(0)
    private Integer reorderThreshold;
}
