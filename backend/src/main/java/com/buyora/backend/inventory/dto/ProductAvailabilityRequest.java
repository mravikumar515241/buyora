package com.buyora.backend.inventory.dto;

import com.buyora.backend.inventory.StockStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductAvailabilityRequest {
    private StockStatus stockStatusOverride;
    private LocalDate expectedRestockDate;
}
