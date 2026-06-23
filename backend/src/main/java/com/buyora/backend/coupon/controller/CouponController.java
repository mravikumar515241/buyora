package com.buyora.backend.coupon.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.coupon.dto.ApplyCouponRequest;
import com.buyora.backend.coupon.dto.CouponResponse;
import com.buyora.backend.coupon.dto.CouponValidationResponse;
import com.buyora.backend.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CouponResponse>>> getActiveCoupons(Pageable pageable) {
        Page<CouponResponse> coupons = couponService.getActiveCoupons(pageable);
        return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved", coupons));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody ApplyCouponRequest request) {
        CouponValidationResponse response = couponService.validateAndCalculate(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }
}
