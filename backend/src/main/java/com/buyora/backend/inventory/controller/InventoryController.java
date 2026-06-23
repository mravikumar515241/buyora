package com.buyora.backend.inventory.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.inventory.dto.*;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.inventory.service.StockRestockService;
import com.buyora.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final StockRestockService stockRestockService;

    @GetMapping("/vendor/dashboard")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryDashboardResponse>> vendorDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getVendorDashboard(principal.getUserId())));
    }

    @GetMapping("/vendor/products")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<List<VendorInventoryItemResponse>>> vendorProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(
                    inventoryService.getVendorInventoryByStatus(principal.getUserId(), status)));
        }
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getVendorInventory(principal.getUserId())));
    }

    @PutMapping("/vendor/products/{productId}/stock")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> setStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody StockSetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.setStock(principal.getUserId(), productId, request)));
    }

    @PostMapping("/vendor/products/{productId}/increase")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> increaseStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.increaseStock(principal.getUserId(), productId, request)));
    }

    @PostMapping("/vendor/products/{productId}/decrease")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> decreaseStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.decreaseStock(principal.getUserId(), productId, request)));
    }

    @PutMapping("/vendor/products/bulk")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<List<VendorInventoryItemResponse>>> bulkUpdate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulkStockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.bulkUpdateStock(principal.getUserId(), request)));
    }

    @GetMapping("/vendor/history")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<Page<InventoryHistoryResponse>>> vendorHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getVendorHistory(principal.getUserId(), PageRequest.of(page, size))));
    }

    @GetMapping("/vendor/notifications")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<Page<StockNotificationResponse>>> notifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getVendorNotifications(principal.getUserId(), PageRequest.of(page, size))));
    }

    @PutMapping("/vendor/notifications/{id}/read")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<Void>> markNotificationRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        inventoryService.markNotificationRead(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/products/{productId}/history")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<InventoryHistoryResponse>>> productHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.getProductHistory(productId, PageRequest.of(page, size))));
    }

    @GetMapping("/vendor/analytics")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryAnalyticsResponse>> vendorAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getVendorAnalytics(principal.getUserId())));
    }

    @PutMapping("/vendor/products/{productId}/thresholds")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> updateThresholds(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody StockThresholdRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.updateThresholds(principal.getUserId(), productId, request)));
    }

    @PutMapping("/vendor/products/{productId}/availability")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<VendorInventoryItemResponse>> updateAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody ProductAvailabilityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.updateAvailability(principal.getUserId(), productId, request)));
    }

    @PostMapping("/vendor/products/upload-sheet")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<List<VendorInventoryItemResponse>>> uploadStockSheet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody String csvContent) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryService.uploadStockSheet(principal.getUserId(), csvContent)));
    }

    @PostMapping("/products/{productId}/notify-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RestockSubscriptionResponse>> subscribeRestock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        stockRestockService.subscribe(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success(
                RestockSubscriptionResponse.builder().subscribed(true).build()));
    }

    @DeleteMapping("/products/{productId}/notify-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RestockSubscriptionResponse>> unsubscribeRestock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        stockRestockService.unsubscribe(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success(
                RestockSubscriptionResponse.builder().subscribed(false).build()));
    }

    @GetMapping("/products/{productId}/notify-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<RestockSubscriptionResponse>> restockStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        boolean subscribed = stockRestockService.isSubscribed(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success(
                RestockSubscriptionResponse.builder().subscribed(subscribed).build()));
    }
}
