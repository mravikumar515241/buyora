package com.buyora.backend.coupon.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.coupon.dto.*;
import com.buyora.backend.coupon.entity.Coupon;
import com.buyora.backend.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public Page<CouponResponse> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CouponResponse> getActiveCoupons(Pageable pageable) {
        return couponRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        // Check if code already exists
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setUsedCount(0);
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidTo(request.getValidTo());
        coupon.setActive(request.isActive());

        coupon = couponRepository.save(coupon);
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        // Check if code is being changed and if it already exists
        if (!coupon.getCode().equals(request.getCode().toUpperCase())) {
            if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
                throw new IllegalArgumentException("Coupon code already exists");
            }
            coupon.setCode(request.getCode().toUpperCase());
        }

        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidTo(request.getValidTo());
        coupon.setActive(request.isActive());

        coupon = couponRepository.save(coupon);
        return toResponse(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateAndCalculate(ApplyCouponRequest request) {
        String code = request.getCouponCode().toUpperCase();
        Coupon coupon = couponRepository.findByCode(code)
                .orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Invalid coupon code")
                    .build();
        }

        // Check if active
        if (!coupon.isActive()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("This coupon is no longer active")
                    .build();
        }

        // Check expiry - Use more lenient validation
        LocalDateTime now = LocalDateTime.now();
        
        // For validFrom, check if the coupon is valid today (ignore exact time if within same day)
        if (now.toLocalDate().isBefore(coupon.getValidFrom().toLocalDate())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("This coupon is not yet valid")
                    .build();
        }
        
        // For validTo, check if the coupon has expired (consider end of day)
        if (now.toLocalDate().isAfter(coupon.getValidTo().toLocalDate())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("This coupon has expired")
                    .build();
        }

        // Check minimum order amount
        if (coupon.getMinOrderAmount() != null && 
            request.getOrderAmount().compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required")
                    .build();
        }

        // Check usage limit
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("This coupon has reached its usage limit")
                    .build();
        }

        // Calculate discount
        BigDecimal discountAmount = calculateDiscount(coupon, request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

        return CouponValidationResponse.builder()
                .valid(true)
                .message("Coupon applied successfully!")
                .couponCode(coupon.getCode())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .build();
    }

    @Transactional
    public void incrementUsageCount(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;

        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            // Calculate percentage discount
            discount = orderAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply maximum discount limit if specified
            if (coupon.getMaxDiscountAmount() != null && 
                discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            // Fixed amount discount
            discount = coupon.getDiscountValue();

            // Discount cannot exceed order amount
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .maxUses(coupon.getMaxUses())
                .usedCount(coupon.getUsedCount())
                .validFrom(coupon.getValidFrom())
                .validTo(coupon.getValidTo())
                .active(coupon.isActive())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
