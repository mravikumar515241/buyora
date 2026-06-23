package com.buyora.backend.payment.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import com.buyora.backend.payment.dto.CreatePaymentRequest;
import com.buyora.backend.payment.dto.CreatePaymentResponse;
import com.buyora.backend.payment.dto.VerifyPaymentRequest;
import com.buyora.backend.payment.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePaymentRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        CreatePaymentResponse response = razorpayService.createOrder(principal.getUserId(), request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("Order created", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        razorpayService.verifyAndCapture(
                principal.getUserId(),
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                request.getOrderId());
        return ResponseEntity.ok(ApiResponse.success("Payment verified", null));
    }
}
