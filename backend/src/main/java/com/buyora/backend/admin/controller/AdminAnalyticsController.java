package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalOrders", orderRepository.count());
        data.put("totalProducts", productRepository.count());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
