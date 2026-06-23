package com.buyora.backend.inventory.dto;

import com.buyora.backend.inventory.entity.InventoryHistory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryHistoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private InventoryHistory.ChangeType changeType;
    private Integer previousStock;
    private Integer newStock;
    private Integer previousReserved;
    private Integer newReserved;
    private Integer quantityChanged;
    private Long changedByUserId;
    private String changedByName;
    private Long orderId;
    private String notes;
    private LocalDateTime createdAt;
}
