package com.buyora.backend.review.repository;

import com.buyora.backend.review.entity.Review;
import com.buyora.backend.review.entity.ReviewModerationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductId(Long productId);

    Page<Review> findByProductIdAndModerationStatus(Long productId, ReviewModerationStatus status, Pageable pageable);

    Page<Review> findByProductId(Long productId, Pageable pageable);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    long countByProductId(Long productId);

    long countByProductIdAndModerationStatus(Long productId, ReviewModerationStatus status);

    void deleteByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.moderationStatus = 'VISIBLE'")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.vendor.id = :vendorId AND r.moderationStatus = 'VISIBLE'")
    Double getAverageRatingByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.vendor.id = :vendorId AND r.moderationStatus = 'VISIBLE'")
    long countByVendorId(@Param("vendorId") Long vendorId);

    Page<Review> findByProduct_VendorId(Long vendorId, Pageable pageable);

    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.moderationStatus = 'VISIBLE' GROUP BY r.rating")
    List<Object[]> getRatingBreakdownByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.moderationStatus = 'VISIBLE' AND SIZE(r.imageUrls) > 0 ORDER BY r.createdAt DESC")
    List<Review> findRecentWithImagesByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT r.product.id, r.product.name, AVG(r.rating) as avgRating, COUNT(r) as cnt " +
           "FROM Review r WHERE r.moderationStatus = 'VISIBLE' GROUP BY r.product.id, r.product.name " +
           "ORDER BY avgRating DESC, cnt DESC")
    List<Object[]> findTopRatedProducts(Pageable pageable);

    @Query("SELECT r.product.id, r.product.name, AVG(r.rating) as avgRating, COUNT(r) as cnt " +
           "FROM Review r WHERE r.moderationStatus = 'VISIBLE' GROUP BY r.product.id, r.product.name " +
           "HAVING COUNT(r) >= :minReviews ORDER BY avgRating ASC, cnt DESC")
    List<Object[]> findWorstRatedProducts(@Param("minReviews") long minReviews, Pageable pageable);

    @Query("SELECT r.product.vendor.id, r.product.vendor.businessName, AVG(r.rating) as avgRating, COUNT(r) as cnt " +
           "FROM Review r WHERE r.moderationStatus = 'VISIBLE' GROUP BY r.product.vendor.id, r.product.vendor.businessName " +
           "ORDER BY avgRating DESC, cnt DESC")
    List<Object[]> findTopRatedVendors(Pageable pageable);

    @Query("SELECT r.product.id, r.product.name, COUNT(r) as cnt FROM Review r WHERE r.moderationStatus = 'VISIBLE' " +
           "GROUP BY r.product.id, r.product.name ORDER BY cnt DESC")
    List<Object[]> findMostReviewedProducts(Pageable pageable);
}
