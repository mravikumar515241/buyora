package com.buyora.backend.discovery.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.discovery.dto.SearchSuggestionResponse;
import com.buyora.backend.discovery.dto.VendorFilterOption;
import com.buyora.backend.discovery.service.DiscoveryService;
import com.buyora.backend.product.dto.ProductResponse;
import com.buyora.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> search(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> categories,
            @RequestParam(required = false) String categoryIds,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        List<Long> categoryList = mergeCategories(categories, categoryIds);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> results = discoveryService.search(
                q, categoryList, minPrice, maxPrice, minRating, vendorId, stockStatus, sort, pageable);

        if (q != null && !q.isBlank()) {
            discoveryService.recordSearch(q, principal != null ? principal.getUserId() : null, (int) results.getTotalElements());
            if (principal != null) {
                discoveryService.saveSearchHistory(principal.getUserId(), q);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<SearchSuggestionResponse>> suggestions(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getSuggestions(q)));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<String>>> trending() {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getTrendingKeywords(10)));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> popular(
            @RequestParam(defaultValue = "12") int limit) {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getPopularProducts(limit)));
    }

    @GetMapping("/similar/{productId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> similar(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getSimilarProducts(productId, limit)));
    }

    @GetMapping("/recently-viewed")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> recentlyViewed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "12") int limit) {
        Long userId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(ApiResponse.success(
                discoveryService.getRecentlyViewed(userId, sessionId, limit)));
    }

    @PostMapping("/views/{productId}")
    public ResponseEntity<ApiResponse<Void>> recordView(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestParam(required = false) String sessionId) {
        Long userId = principal != null ? principal.getUserId() : null;
        discoveryService.recordProductView(productId, userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<VendorFilterOption>>> vendors() {
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getVendorFilterOptions()));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<String>>> history(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(discoveryService.getSearchHistory(principal.getUserId())));
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> clearHistory(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        discoveryService.clearSearchHistory(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private List<Long> mergeCategories(List<Long> categories, String categoryIds) {
        if (categories != null && !categories.isEmpty()) return categories;
        if (categoryIds == null || categoryIds.isBlank()) return List.of();
        return Arrays.stream(categoryIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
