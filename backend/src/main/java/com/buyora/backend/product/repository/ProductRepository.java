package com.buyora.backend.product.repository;

import com.buyora.backend.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(Product.ProductStatus status, Pageable pageable);

    Page<Product> findByVendorId(Long vendorId, Pageable pageable);
    long countByVendorId(Long vendorId);
    int deleteByVendorId(Long vendorId);

    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED'")
    Page<Product> findAllApproved(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findAllApprovedByNameContaining(String name, Pageable pageable);

    Page<Product> findByCategoryIdAndStatus(Long categoryId, Product.ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.status = 'APPROVED' AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findByCategoryIdAndStatusAndNameContaining(Long categoryId, String name, Product.ProductStatus status, Pageable pageable);

    long countByCategoryId(Long categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.vendor.id = :vendorId AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= 0")
    long countOutOfStockByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.vendor.id = :vendorId AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) > 0 " +
           "AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= COALESCE(p.lowStockThreshold, 10)")
    long countLowStockByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(p) FROM Product p WHERE (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= 0")
    long countOutOfStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) > 0 " +
           "AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= COALESCE(p.lowStockThreshold, 10)")
    long countLowStock();

    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= 0")
    Page<Product> findOutOfStockByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) > 0 " +
           "AND (COALESCE(p.stock, 0) - COALESCE(p.reservedQuantity, 0)) <= COALESCE(p.lowStockThreshold, 10)")
    Page<Product> findLowStockByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(COALESCE(p.stock, 0)), 0) FROM Product p WHERE p.vendor.id = :vendorId")
    long sumStockUnitsByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COALESCE(SUM(COALESCE(p.stock, 0)), 0) FROM Product p")
    long sumTotalStockUnits();

    @Query("SELECT COALESCE(SUM(p.price * COALESCE(p.stock, 0)), 0) FROM Product p WHERE p.vendor.id = :vendorId")
    java.math.BigDecimal sumInventoryValueByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COALESCE(SUM(p.price * COALESCE(p.stock, 0)), 0) FROM Product p")
    java.math.BigDecimal sumTotalInventoryValue();
}
