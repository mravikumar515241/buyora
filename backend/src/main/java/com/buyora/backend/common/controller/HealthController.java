package com.buyora.backend.common.controller;

import com.buyora.backend.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health and readiness endpoint for the application.
 * Used by frontend, load balancers, and CI/CD to verify backend is up.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.application.name:backend}")
    private String applicationName;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
                "status", "UP",
                "application", applicationName,
                "message", "Buyora Backend Running"
        );
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", data));
    }
}
