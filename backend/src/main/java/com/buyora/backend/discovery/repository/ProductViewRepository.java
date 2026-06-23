package com.buyora.backend.discovery.repository;

import com.buyora.backend.discovery.entity.ProductView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    @Query("SELECT pv.product.id, COUNT(pv) FROM ProductView pv GROUP BY pv.product.id ORDER BY COUNT(pv) DESC")
    List<Object[]> findMostViewedProductIds(Pageable pageable);

    @Query("SELECT pv FROM ProductView pv WHERE pv.user.id = :userId ORDER BY pv.createdAt DESC")
    List<ProductView> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT pv FROM ProductView pv WHERE pv.sessionId = :sessionId ORDER BY pv.createdAt DESC")
    List<ProductView> findRecentBySessionId(@Param("sessionId") String sessionId, Pageable pageable);
}
