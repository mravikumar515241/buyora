package com.buyora.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDetailsResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String businessName;
    private String businessDescription;
    private String status;
    private Integer totalProducts;
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
