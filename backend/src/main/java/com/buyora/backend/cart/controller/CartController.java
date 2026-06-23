package com.buyora.backend.cart.controller;

import com.buyora.backend.cart.dto.CartItemResponse;
import com.buyora.backend.cart.dto.CartResponse;
import com.buyora.backend.cart.service.CartService;
import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(principal.getUserId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItemResponse>> add(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        CartItemResponse item = cartService.addToCart(principal.getUserId(), productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Added to cart", item));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestParam int quantity) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        cartService.updateQuantity(principal.getUserId(), productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", null));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        cartService.remove(principal.getUserId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed", null));
    }
}
