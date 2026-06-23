package com.buyora.backend.vendor.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.review.repository.ReviewRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.dto.VendorProfileResponse;
import com.buyora.backend.vendor.dto.VendorRequest;
import com.buyora.backend.vendor.dto.VendorResponse;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public VendorResponse registerVendor(Long userId, VendorRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (vendorRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("User is already registered as a vendor.");
        }
        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setBusinessName(request.getBusinessName());
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());
        vendor.setGstNumber(request.getGstNumber());
        vendor.setApproved(false);
        vendor = vendorRepository.save(vendor);
        return toResponse(vendor);
    }

    @Transactional
    public VendorResponse update(Long userId, VendorRequest request) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "userId", userId));
        vendor.setBusinessName(request.getBusinessName());
        vendor.setPhone(request.getPhone());
        vendor.setAddress(request.getAddress());
        vendor.setGstNumber(request.getGstNumber());
        vendor = vendorRepository.save(vendor);
        return toResponse(vendor);
    }

    @Transactional(readOnly = true)
    public VendorResponse getByUserId(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "userId", userId));
        return toResponse(vendor);
    }

    @Transactional(readOnly = true)
    public Vendor getVendorEntityByUserId(Long userId) {
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "userId", userId));
    }

    @Transactional(readOnly = true)
    public Optional<Vendor> findVendorEntityByUserId(Long userId) {
        return vendorRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public VendorProfileResponse getProfileById(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", vendorId));

        Double productRating = reviewRepository.getAverageRatingByVendorId(vendorId);
        double avgProduct = productRating != null ? productRating : 0.0;
        long reviewCount = reviewRepository.countByVendorId(vendorId);
        long productCount = productRepository.countByVendorId(vendorId);
        long totalSales = orderRepository.countCompletedSalesByVendorId(vendorId);
        long delivered = orderRepository.countDeliveredOrdersByVendorId(vendorId);
        long shippedOrDelivered = orderRepository.countShippedOrDeliveredByVendorId(vendorId);

        double deliveryRating = shippedOrDelivered > 0
                ? Math.round((delivered * 5.0 / shippedOrDelivered) * 10.0) / 10.0
                : 0.0;
        double satisfaction = Math.round(((avgProduct * 0.7) + (deliveryRating * 0.3)) * 10.0) / 10.0;
        double vendorRating = Math.round(((avgProduct + satisfaction) / 2.0) * 10.0) / 10.0;

        List<String> badges = computeBadges(vendor, avgProduct, reviewCount, totalSales, deliveryRating, shippedOrDelivered);

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .averageRating(Math.round(avgProduct * 10.0) / 10.0)
                .averageDeliveryRating(deliveryRating)
                .customerSatisfactionScore(satisfaction)
                .vendorRating(vendorRating)
                .productCount(productCount)
                .reviewCount(reviewCount)
                .totalSales(totalSales)
                .memberSince(vendor.getCreatedAt())
                .badges(badges)
                .build();
    }

    private List<String> computeBadges(Vendor vendor, double avgProduct, long reviewCount,
                                       long totalSales, double deliveryRating, long shippedOrDelivered) {
        List<String> badges = new ArrayList<>();
        if (totalSales >= 50) badges.add("Top Seller");
        if (avgProduct >= 4.5 && reviewCount >= 5) badges.add("Highly Rated");
        if (deliveryRating >= 4.5 && shippedOrDelivered >= 10) badges.add("Fast Shipping");
        if (vendor.isApproved() && avgProduct >= 4.0 && totalSales >= 10) badges.add("Trusted Vendor");
        return badges;
    }

    private VendorResponse toResponse(Vendor v) {
        return VendorResponse.builder()
                .id(v.getId())
                .userId(v.getUser().getId())
                .businessName(v.getBusinessName())
                .phone(v.getPhone())
                .address(v.getAddress())
                .gstNumber(v.getGstNumber())
                .approved(v.isApproved())
                .build();
    }
}
