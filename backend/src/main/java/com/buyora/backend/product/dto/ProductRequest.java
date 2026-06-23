package com.buyora.backend.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;
    private String description;
    @NotNull
    @DecimalMin(value = "0.01", message = "Price must be positive")
    private BigDecimal price;
    private Integer stock = 0;
    @NotNull(message = "Category is required")
    private Long categoryId;
    private List<String> imageUrls;
    private List<String> tags;
}
