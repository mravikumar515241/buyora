package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.review.dto.ReviewAnalyticsResponse;
import com.buyora.backend.review.dto.ReviewModerationRequest;
import com.buyora.backend.review.dto.ReviewResponse;
import com.buyora.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long vendorId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(reviewService.findAllForAdmin(pageable, productId, vendorId)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<ReviewAnalyticsResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAnalytics()));
    }

    @PostMapping("/{id}/hide")
    public ResponseEntity<ApiResponse<ReviewResponse>> hide(
            @PathVariable Long id,
            @Valid @RequestBody ReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.hideReview(id, request.getReason())));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<ReviewResponse>> restore(
            @PathVariable Long id,
            @Valid @RequestBody ReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.restoreReview(id, request.getReason())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
