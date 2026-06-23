package com.buyora.backend.vendor.repository;

import com.buyora.backend.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
