package com.buyora.backend.coupon.repository;

import com.buyora.backend.coupon.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    Optional<Coupon> findByCodeAndActiveTrue(String code);
    Page<Coupon> findByActiveTrue(Pageable pageable);
    boolean existsByCode(String code);
}
