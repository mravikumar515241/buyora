package com.buyora.backend.inventory.repository;

import com.buyora.backend.inventory.entity.StockRestockSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRestockSubscriptionRepository extends JpaRepository<StockRestockSubscription, Long> {

    Optional<StockRestockSubscription> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductIdAndActiveTrue(Long userId, Long productId);

    List<StockRestockSubscription> findByProductIdAndActiveTrueAndNotifiedFalse(Long productId);
}
