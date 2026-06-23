package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.wishlist.dto.WishlistAnalyticsResponse;
import com.buyora.backend.wishlist.dto.TopWishlistedProductResponse;
import com.buyora.backend.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminWishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<WishlistAnalyticsResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getAnalytics()));
    }

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<TopWishlistedProductResponse>>> topWishlisted(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getTopWishlistedProducts(limit)));
    }
}
