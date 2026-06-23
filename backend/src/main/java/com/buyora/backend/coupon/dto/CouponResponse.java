package com.buyora.backend.coupon.dto;

import com.buyora.backend.coupon.entity.Coupon;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CouponResponse {
    
    private Long id;
    private String code;
    private Coupon.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer maxUses;
    private Integer usedCount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
