package com.buyora.backend.order.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.order.dto.CheckoutRequest;
import com.buyora.backend.order.dto.OrderResponse;
import com.buyora.backend.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        OrderResponse order = orderService.checkout(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order created", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> myOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(principal.getUserId(), pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(orderService.getById(principal.getUserId(), id)));
    }
}
