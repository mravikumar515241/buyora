package com.buyora.backend.wishlist.repository;

import com.buyora.backend.wishlist.entity.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {

    List<SavedItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SavedItem> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    long countByUserId(Long userId);
}
