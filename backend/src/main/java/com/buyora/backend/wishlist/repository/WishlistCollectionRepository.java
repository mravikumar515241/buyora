package com.buyora.backend.wishlist.repository;

import com.buyora.backend.wishlist.entity.WishlistCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistCollectionRepository extends JpaRepository<WishlistCollection, Long> {

    List<WishlistCollection> findByUserIdOrderByDefaultListDescCreatedAtAsc(Long userId);

    Optional<WishlistCollection> findByUserIdAndDefaultListTrue(Long userId);

    Optional<WishlistCollection> findByIdAndUserId(Long id, Long userId);

    Optional<WishlistCollection> findByShareToken(String shareToken);

    long countByUserId(Long userId);
}
