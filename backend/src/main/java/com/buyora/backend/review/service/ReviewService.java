package com.buyora.backend.review.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.order.entity.Order;
import com.buyora.backend.order.entity.OrderItem;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.review.dto.*;
import com.buyora.backend.review.entity.Review;
import com.buyora.backend.review.entity.ReviewHelpfulVote;
import com.buyora.backend.review.entity.ReviewModerationStatus;
import com.buyora.backend.review.repository.ReviewHelpfulVoteRepository;
import com.buyora.backend.review.repository.ReviewRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulVoteRepository helpfulVoteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse create(Long userId, Long productId, ReviewRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!orderRepository.hasUserPurchasedProduct(userId, productId)) {
            throw new IllegalArgumentException("You can only review products you have purchased and received.");
        }

        if (reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this product.");
        }

        Order deliveredOrder = findLatestDeliveredOrder(userId, productId);
        Long orderItemId = deliveredOrder.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .map(OrderItem::getId)
                .findFirst()
                .orElse(null);

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setTitle(trimOrEmpty(request.getTitle()));
        review.setComment(trimOrEmpty(request.getComment()));
        review.setOrderId(deliveredOrder.getId());
        review.setOrderItemId(orderItemId);
        review.setImageUrls(sanitizeImageUrls(request.getImageUrls()));
        review = reviewRepository.save(review);
        return toResponse(review, userId);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getByProduct(Long productId, Pageable pageable, String sort, Long viewerUserId) {
        Sort order = parseSort(sort);
        Pageable withSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), order);
        Page<Review> page = reviewRepository.findByProductIdAndModerationStatus(
                productId, ReviewModerationStatus.VISIBLE, withSort);
        List<ReviewResponse> content = page.getContent().stream()
                .map(r -> toResponse(r, viewerUserId))
                .toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse getProductSummary(Long productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        long total = reviewRepository.countByProductIdAndModerationStatus(productId, ReviewModerationStatus.VISIBLE);

        Map<Integer, Long> counts = new HashMap<>();
        for (int i = 1; i <= 5; i++) counts.put(i, 0L);
        for (Object[] row : reviewRepository.getRatingBreakdownByProductId(productId)) {
            counts.put((Integer) row[0], (Long) row[1]);
        }

        List<RatingBreakdownItem> breakdown = new ArrayList<>();
        for (int stars = 5; stars >= 1; stars--) {
            long count = counts.getOrDefault(stars, 0L);
            int pct = total > 0 ? (int) Math.round(count * 100.0 / total) : 0;
            breakdown.add(RatingBreakdownItem.builder().stars(stars).count(count).percentage(pct).build());
        }

        List<String> recentImages = reviewRepository
                .findRecentWithImagesByProductId(productId, PageRequest.of(0, 20))
                .stream()
                .flatMap(r -> r.getImageUrls().stream())
                .limit(20)
                .toList();

        return ProductReviewSummaryResponse.builder()
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0)
                .totalReviews(total)
                .breakdown(breakdown)
                .recentReviewImages(recentImages)
                .build();
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        return avg != null ? avg : 0.0;
    }

    @Transactional(readOnly = true)
    public long getReviewCount(Long productId) {
        return reviewRepository.countByProductIdAndModerationStatus(productId, ReviewModerationStatus.VISIBLE);
    }

    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Long userId, Long productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean canUserReview(Long userId, Long productId) {
        return orderRepository.hasUserPurchasedProduct(userId, productId)
                && reviewRepository.findByUserIdAndProductId(userId, productId).isEmpty();
    }

    @Transactional(readOnly = true)
    public ReviewResponse getUserReviewForProduct(Long userId, Long productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId)
                .map(r -> toResponse(r, userId))
                .orElse(null);
    }

    @Transactional
    public ReviewResponse update(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own reviews.");
        }

        review.setRating(request.getRating());
        review.setTitle(trimOrEmpty(request.getTitle()));
        review.setComment(trimOrEmpty(request.getComment()));
        review.setImageUrls(sanitizeImageUrls(request.getImageUrls()));
        review = reviewRepository.save(review);
        return toResponse(review, userId);
    }

    @Transactional
    public void deleteByUser(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own reviews.");
        }

        helpfulVoteRepository.deleteByReviewId(reviewId);
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponse voteHelpful(Long userId, Long reviewId, boolean helpful) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (review.getModerationStatus() != ReviewModerationStatus.VISIBLE) {
            throw new IllegalArgumentException("This review is not available.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        var existing = helpfulVoteRepository.findByUserIdAndReviewId(userId, reviewId);
        if (existing.isPresent()) {
            ReviewHelpfulVote vote = existing.get();
            if (vote.getHelpful().equals(helpful)) {
                return toResponse(review, userId);
            }
            adjustHelpfulCounts(review, vote.getHelpful(), false);
            vote.setHelpful(helpful);
            adjustHelpfulCounts(review, helpful, true);
            helpfulVoteRepository.save(vote);
        } else {
            ReviewHelpfulVote vote = new ReviewHelpfulVote();
            vote.setUser(user);
            vote.setReview(review);
            vote.setHelpful(helpful);
            adjustHelpfulCounts(review, helpful, true);
            helpfulVoteRepository.save(vote);
        }

        review = reviewRepository.save(review);
        return toResponse(review, userId);
    }

    @Transactional
    public ReviewResponse hideReview(Long reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setModerationStatus(ReviewModerationStatus.HIDDEN);
        review.setModerationReason(reason.trim());
        return toResponse(reviewRepository.save(review), null);
    }

    @Transactional
    public ReviewResponse restoreReview(Long reviewId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setModerationStatus(ReviewModerationStatus.VISIBLE);
        review.setModerationReason(reason.trim());
        return toResponse(reviewRepository.save(review), null);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> findAllForAdmin(Pageable pageable, Long productId, Long vendorId) {
        Page<Review> page;
        if (productId != null) {
            page = reviewRepository.findByProductId(productId, pageable);
        } else if (vendorId != null) {
            page = reviewRepository.findByProduct_VendorId(vendorId, pageable);
        } else {
            page = reviewRepository.findAll(pageable);
        }
        return new PageImpl<>(
                page.getContent().stream().map(r -> toResponse(r, null)).toList(),
                page.getPageable(),
                page.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public ReviewAnalyticsResponse getAnalytics() {
        return ReviewAnalyticsResponse.builder()
                .topRatedProducts(mapAnalytics(reviewRepository.findTopRatedProducts(PageRequest.of(0, 10))))
                .worstRatedProducts(mapAnalytics(reviewRepository.findWorstRatedProducts(3, PageRequest.of(0, 10))))
                .topRatedVendors(mapVendorAnalytics(reviewRepository.findTopRatedVendors(PageRequest.of(0, 10))))
                .mostReviewedProducts(mapCountAnalytics(reviewRepository.findMostReviewedProducts(PageRequest.of(0, 10))))
                .build();
    }

    @Transactional
    public void deleteById(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review", "id", reviewId);
        }
        helpfulVoteRepository.deleteByReviewId(reviewId);
        reviewRepository.deleteById(reviewId);
    }

    private Order findLatestDeliveredOrder(Long userId, Long productId) {
        List<Order> orders = orderRepository.findDeliveredOrdersContainingProduct(
                userId, productId, PageRequest.of(0, 1));
        if (orders.isEmpty()) {
            throw new IllegalArgumentException("You can only review products you have received.");
        }
        return orders.get(0);
    }

    private void adjustHelpfulCounts(Review review, boolean helpful, boolean increment) {
        int delta = increment ? 1 : -1;
        if (helpful) {
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() + delta));
        } else {
            review.setNotHelpfulCount(Math.max(0, review.getNotHelpfulCount() + delta));
        }
    }

    private List<String> sanitizeImageUrls(List<String> urls) {
        if (urls == null) return new ArrayList<>();
        return urls.stream()
                .filter(u -> u != null && !u.isBlank())
                .map(String::trim)
                .limit(5)
                .collect(Collectors.toList());
    }

    private String trimOrEmpty(String value) {
        return value != null ? value.trim() : "";
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort.toLowerCase()) {
            case "highest" -> Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case "lowest" -> Sort.by(Sort.Direction.ASC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            case "helpful" -> Sort.by(Sort.Direction.DESC, "helpfulCount").and(Sort.by(Sort.Direction.DESC, "createdAt"));
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private List<ReviewAnalyticsItem> mapAnalytics(List<Object[]> rows) {
        return rows.stream().map(row -> ReviewAnalyticsItem.builder()
                .id((Long) row[0])
                .name((String) row[1])
                .averageRating(Math.round(((Number) row[2]).doubleValue() * 10.0) / 10.0)
                .reviewCount(((Number) row[3]).longValue())
                .build()).toList();
    }

    private List<ReviewAnalyticsItem> mapVendorAnalytics(List<Object[]> rows) {
        return rows.stream().map(row -> ReviewAnalyticsItem.builder()
                .id((Long) row[0])
                .name((String) row[1])
                .averageRating(Math.round(((Number) row[2]).doubleValue() * 10.0) / 10.0)
                .reviewCount(((Number) row[3]).longValue())
                .build()).toList();
    }

    private List<ReviewAnalyticsItem> mapCountAnalytics(List<Object[]> rows) {
        return rows.stream().map(row -> ReviewAnalyticsItem.builder()
                .id((Long) row[0])
                .name((String) row[1])
                .reviewCount(((Number) row[2]).longValue())
                .build()).toList();
    }

    private ReviewResponse toResponse(Review r, Long viewerUserId) {
        Boolean userMarkedHelpful = null;
        if (viewerUserId != null) {
            userMarkedHelpful = helpfulVoteRepository.findByUserIdAndReviewId(viewerUserId, r.getId())
                    .map(ReviewHelpfulVote::getHelpful)
                    .orElse(null);
        }

        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .productName(r.getProduct().getName())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .imageUrls(r.getImageUrls() != null ? r.getImageUrls() : List.of())
                .verifiedPurchase(r.getOrderId() != null)
                .orderId(r.getOrderId())
                .moderationStatus(r.getModerationStatus())
                .moderationReason(r.getModerationReason())
                .helpfulCount(r.getHelpfulCount())
                .notHelpfulCount(r.getNotHelpfulCount())
                .userMarkedHelpful(userMarkedHelpful)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
