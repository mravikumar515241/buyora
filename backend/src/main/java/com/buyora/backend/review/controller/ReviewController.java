package com.buyora.backend.review.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.review.dto.ProductReviewSummaryResponse;
import com.buyora.backend.review.dto.ReviewRequest;
import com.buyora.backend.review.dto.ReviewResponse;
import com.buyora.backend.review.service.ReviewService;
import com.buyora.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(reviewService.create(principal.getUserId(), productId, request)));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getByProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        Pageable pageable = PageRequest.of(page, size);
        Long viewerId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(ApiResponse.success(reviewService.getByProduct(productId, pageable, sort, viewerId)));
    }

    @GetMapping("/products/{productId}/summary")
    public ResponseEntity<ApiResponse<ProductReviewSummaryResponse>> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductSummary(productId)));
    }

    @GetMapping("/products/{productId}/can-review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> canReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("canReview", false, "alreadyReviewed", false)));
        }
        boolean alreadyReviewed = reviewService.hasUserReviewed(principal.getUserId(), productId);
        boolean canReview = reviewService.canUserReview(principal.getUserId(), productId);
        ReviewResponse existingReview = reviewService.getUserReviewForProduct(principal.getUserId(), productId);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "canReview", canReview,
            "alreadyReviewed", alreadyReviewed,
            "existingReview", existingReview != null ? existingReview : Map.of()
        )));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(reviewService.update(principal.getUserId(), reviewId, request)));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long reviewId) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        reviewService.deleteByUser(principal.getUserId(), reviewId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{reviewId}/vote")
    public ResponseEntity<ApiResponse<ReviewResponse>> vote(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long reviewId,
            @RequestParam boolean helpful) {
        if (principal == null) return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        return ResponseEntity.ok(ApiResponse.success(reviewService.voteHelpful(principal.getUserId(), reviewId, helpful)));
    }
}
