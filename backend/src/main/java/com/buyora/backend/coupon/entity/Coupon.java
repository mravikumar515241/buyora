package com.buyora.backend.coupon.entity;

import com.buyora.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Getter
@Setter
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    private Integer maxUses;
    
    @Column(nullable = false)
    private Integer usedCount = 0;
    
    @Column(nullable = false)
    private LocalDateTime validFrom;
    
    @Column(nullable = false)
    private LocalDateTime validTo;
    
    @Column(nullable = false)
    private boolean active = true;

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }
}
