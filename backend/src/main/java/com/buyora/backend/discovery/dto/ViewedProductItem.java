package com.buyora.backend.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ViewedProductItem {
    private Long productId;
    private String productName;
    private Long viewCount;
}
