package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FlashSaleResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean active;
    private BigDecimal discountPercent;
    private Integer stockAllocationLimit;
    private List<FlashSaleItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
