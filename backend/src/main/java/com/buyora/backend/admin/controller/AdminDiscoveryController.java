package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.discovery.dto.DiscoveryAnalyticsResponse;
import com.buyora.backend.discovery.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/discovery")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DiscoveryAnalyticsResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getAnalytics()));
    }
}
