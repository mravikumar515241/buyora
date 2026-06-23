package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.order.dto.OrderResponse;
import com.buyora.backend.order.entity.Order;
import com.buyora.backend.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrdersForAdmin(pageable)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        OrderResponse order = orderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
}
