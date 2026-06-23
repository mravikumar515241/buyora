package com.buyora.backend.coupon.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CouponValidationResponse {
    
    private boolean valid;
    private String message;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
