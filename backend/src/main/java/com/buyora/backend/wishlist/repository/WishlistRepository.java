package com.buyora.backend.wishlist.repository;

import com.buyora.backend.wishlist.entity.WishlistItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<WishlistItem> findByCollectionIdOrderByCreatedAtDesc(Long collectionId);

    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<WishlistItem> findByCollectionIdOrderByCreatedAtDesc(Long collectionId, Pageable pageable);

    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);

    Optional<WishlistItem> findByCollectionIdAndProductId(Long collectionId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    boolean existsByCollectionIdAndProductId(Long collectionId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    void deleteByCollectionIdAndProductId(Long collectionId, Long productId);

    long countByUserId(Long userId);

    long countByCollectionId(Long collectionId);

    long countByProductId(Long productId);

    List<WishlistItem> findByProductId(Long productId);

    @Query("SELECT w.product.id, w.product.name, COUNT(w) FROM WishlistItem w GROUP BY w.product.id, w.product.name ORDER BY COUNT(w) DESC")
    List<Object[]> findTopWishlistedProducts(Pageable pageable);

    @Query("SELECT w.product.category.id, w.product.category.name, COUNT(w) FROM WishlistItem w WHERE w.product.category IS NOT NULL GROUP BY w.product.category.id, w.product.category.name ORDER BY COUNT(w) DESC")
    List<Object[]> countByCategory(Pageable pageable);

    @Query("SELECT COUNT(w) FROM WishlistItem w WHERE w.createdAt >= :since")
    long countAddedSince(@Param("since") java.time.LocalDateTime since);

    @Query("SELECT w.product.id, COUNT(w) FROM WishlistItem w WHERE w.product.vendor.id = :vendorId GROUP BY w.product.id")
    List<Object[]> countByVendorProducts(@Param("vendorId") Long vendorId);
}
