package com.buyora.backend.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StockNotificationResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer threshold;
    private Integer availableQuantity;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
}
