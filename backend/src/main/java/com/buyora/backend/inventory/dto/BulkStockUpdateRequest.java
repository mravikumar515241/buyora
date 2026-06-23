package com.buyora.backend.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkStockUpdateRequest {
    @NotEmpty
    @Valid
    private List<BulkStockItem> items;

    @Data
    public static class BulkStockItem {
        @NotNull
        private Long productId;

        @NotNull
        @Min(0)
        private Integer stockQuantity;
    }
}
