package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.inventory.dto.*;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminInventoryDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAdminDashboard()));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<AdminInventoryListItemResponse>>> products(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAdminInventory(PageRequest.of(page, size))));
    }

    @PutMapping("/products/{productId}/stock")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> setStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody StockSetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.adminSetStock(productId, request, principal.getUserId())));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<InventoryHistoryResponse>>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getAdminHistory(PageRequest.of(page, size))));
    }
}
