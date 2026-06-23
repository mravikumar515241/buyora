package com.buyora.backend.order.repository;

import com.buyora.backend.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.buyora.backend.inventory.dto.TopSellingProductResponse;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND o.status = 'DELIVERED'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND o.status = 'DELIVERED' ORDER BY o.createdAt DESC")
    List<Order> findDeliveredOrdersContainingProduct(@Param("userId") Long userId, @Param("productId") Long productId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    long countCompletedSalesByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId AND o.status = 'DELIVERED'")
    long countDeliveredOrdersByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId AND o.status IN ('SHIPPED', 'DELIVERED')")
    long countShippedOrDeliveredByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId")
    int countByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o JOIN o.items i WHERE i.product.vendor.id = :vendorId AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    BigDecimal sumTotalAmountByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT new com.buyora.backend.inventory.dto.TopSellingProductResponse(i.product.id, i.product.name, SUM(i.quantity)) " +
           "FROM OrderItem i JOIN i.order o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
           "AND i.product.vendor.id = :vendorId " +
           "GROUP BY i.product.id, i.product.name ORDER BY SUM(i.quantity) DESC")
    List<TopSellingProductResponse> findTopSellingProductsByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT new com.buyora.backend.inventory.dto.TopSellingProductResponse(i.product.id, i.product.name, SUM(i.quantity)) " +
           "FROM OrderItem i JOIN i.order o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
           "AND i.product.vendor.id = :vendorId " +
           "GROUP BY i.product.id, i.product.name ORDER BY SUM(i.quantity) ASC")
    List<TopSellingProductResponse> findLeastSellingProductsByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT new com.buyora.backend.inventory.dto.TopSellingProductResponse(i.product.id, i.product.name, SUM(i.quantity)) " +
           "FROM OrderItem i JOIN i.order o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') " +
           "GROUP BY i.product.id, i.product.name ORDER BY SUM(i.quantity) DESC")
    List<TopSellingProductResponse> findTopSellingProducts(Pageable pageable);
}
