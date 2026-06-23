package com.buyora.backend.product.dto;

import com.buyora.backend.product.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer soldQuantity;
    private String sku;
    private Integer lowStockThreshold;
    private Integer reorderThreshold;
    private String stockStatus;
    private java.time.LocalDate expectedRestockDate;
    private Boolean restockSubscribed;
    private Long categoryId;
    private String categoryName;
    private Long vendorId;
    private Long vendorUserId; // Added: The user ID of the vendor who owns this product
    private String vendorBusinessName;
    private String vendorEmail;
    private Product.ProductStatus status;
    private List<String> imageUrls;
    private List<String> tags;
    private String adminComments;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double averageRating;
    private Long reviewCount;
}
