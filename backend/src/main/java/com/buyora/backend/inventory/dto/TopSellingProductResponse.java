package com.buyora.backend.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopSellingProductResponse {
    private Long productId;
    private String productName;
    private Long totalQuantitySold;
}
