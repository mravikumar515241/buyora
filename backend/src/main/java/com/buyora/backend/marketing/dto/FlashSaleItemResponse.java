package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FlashSaleItemResponse {
    private Long id;
    private Long productId;
    private Long categoryId;
    private Integer allocatedStock;
    private Integer saleLimit;
}
