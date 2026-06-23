package com.buyora.backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockSetRequest {
    @NotNull
    @Min(0)
    private Integer stockQuantity;

    private String notes;
}
