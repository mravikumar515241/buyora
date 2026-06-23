package com.buyora.backend.coupon.dto;

import com.buyora.backend.coupon.entity.Coupon;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    
    @NotBlank(message = "Coupon code is required")
    private String code;
    
    @NotNull(message = "Discount type is required")
    private Coupon.DiscountType discountType;
    
    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;
    
    private BigDecimal minOrderAmount;
    
    private BigDecimal maxDiscountAmount;
    
    private Integer maxUses;
    
    @NotNull(message = "Valid from date is required")
    private LocalDateTime validFrom;
    
    @NotNull(message = "Valid to date is required")
    private LocalDateTime validTo;
    
    private boolean active = true;
}
