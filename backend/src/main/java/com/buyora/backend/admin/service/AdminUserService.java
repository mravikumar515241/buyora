package com.buyora.backend.admin.service;

import com.buyora.backend.admin.dto.UserListResponse;
import com.buyora.backend.admin.dto.VendorDetailsResponse;
import com.buyora.backend.cart.repository.CartItemRepository;
import com.buyora.backend.review.repository.ReviewRepository;
import com.buyora.backend.user.entity.Role;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.RoleRepository;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.repository.VendorRepository;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.notification.service.NotificationDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final RoleRepository roleRepository;
    private final AdminSettingsService adminSettingsService;
    private final CartItemRepository cartItemRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationDispatcher notificationDispatcher;

    @Transactional(readOnly = true)
    public Page<UserListResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserListResponse);
    }

    @Transactional(readOnly = true)
    public Page<VendorDetailsResponse> getAllVendors(Pageable pageable) {
        return vendorRepository.findAll(pageable)
                .map(this::mapToVendorDetailsResponse);
    }

    @Transactional(readOnly = true)
    public UserListResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToUserListResponse(user);
    }

    @Transactional(readOnly = true)
    public VendorDetailsResponse getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
        return mapToVendorDetailsResponse(vendor);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Prevent deletion of admin users
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
        if (isAdmin) {
            throw new RuntimeException("Cannot delete admin users. Admin accounts are protected for system security.");
        }
        
        // Check if data loss deletion is allowed
        if (!adminSettingsService.isUserDeletionWithDataLossAllowed()) {
            throw new RuntimeException("User deletion with data loss is not enabled. Please enable it in admin settings first.");
        }
        
        // Delete all related data
        log.warn("DELETING USER WITH ALL DATA - User ID: {}, Email: {}", id, user.getEmail());
        
        // Check if user is also a vendor and delete vendor data first
        vendorRepository.findByUserId(id).ifPresent(vendor -> {
            log.warn("User is also a vendor - deleting vendor data first. Vendor ID: {}", vendor.getId());
            
            // Delete vendor's products (which will cascade to product-related data)
            int deletedProducts = productRepository.deleteByVendorId(vendor.getId());
            log.info("Deleted {} products for vendor: {}", deletedProducts, vendor.getId());
            
            // Delete the vendor record
            vendorRepository.delete(vendor);
            log.info("Deleted vendor record: {}", vendor.getId());
        });
        
        // Delete cart items
        cartItemRepository.deleteByUserId(id);
        log.info("Deleted cart items for user: {}", id);
        
        // Delete reviews
        reviewRepository.deleteByUserId(id);
        log.info("Deleted reviews for user: {}", id);
        
        // Note: Orders are kept for business records but anonymized
        // You could delete orders too if needed by uncommenting:
        // orderRepository.deleteByUserId(id);
        
        userRepository.delete(user);
        log.info("User deleted by admin with all data: {}", id);
    }

    @Transactional
    public UserListResponse toggleUserActiveStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        
        String status = user.isActive() ? "activated" : "deactivated";
        log.info("User {} by admin: {}", status, userId);
        
        return mapToUserListResponse(user);
    }

    @Transactional
    public UserListResponse updateUserRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            roles.add(role);
        }

        user.setRoles(roles);
        userRepository.save(user);
        log.info("User roles updated by admin for user: {}", userId);

        return mapToUserListResponse(user);
    }

    @Transactional
    public VendorDetailsResponse approveVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
        
        vendor.setApproved(true);
        vendorRepository.save(vendor);
        log.info("Vendor approved by admin: {}", vendorId);
        notificationDispatcher.vendorApproved(vendor.getUser().getId());

        return mapToVendorDetailsResponse(vendor);
    }

    @Transactional
    public VendorDetailsResponse rejectVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
        
        vendor.setApproved(false);
        vendorRepository.save(vendor);
        log.info("Vendor rejected by admin: {}", vendorId);
        notificationDispatcher.vendorRejected(vendor.getUser().getId());

        return mapToVendorDetailsResponse(vendor);
    }

    @Transactional
    public void deleteVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
        
        // Check if data loss deletion is allowed
        if (!adminSettingsService.isUserDeletionWithDataLossAllowed()) {
            throw new RuntimeException("Vendor deletion with data loss is not enabled. Please enable it in admin settings first.");
        }
        
        log.warn("DELETING VENDOR WITH ALL DATA - Vendor ID: {}, Business: {}", vendorId, vendor.getBusinessName());
        
        // Delete vendor's products (which will cascade to product-related data)
        int deletedProducts = productRepository.deleteByVendorId(vendorId);
        log.info("Deleted {} products for vendor: {}", deletedProducts, vendorId);
        
        vendorRepository.delete(vendor);
        log.info("Vendor deleted by admin: {}", vendorId);
    }

    private UserListResponse mapToUserListResponse(User user) {
        return UserListResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .active(user.isActive())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private VendorDetailsResponse mapToVendorDetailsResponse(Vendor vendor) {
        long productCount = productRepository.countByVendorId(vendor.getId());
        int orderCount = orderRepository.countByVendorId(vendor.getId());
        BigDecimal revenue = orderRepository.sumTotalAmountByVendorId(vendor.getId());

        return VendorDetailsResponse.builder()
                .id(vendor.getId())
                .userId(vendor.getUser().getId())
                .userName(vendor.getUser().getFullName())
                .userEmail(vendor.getUser().getEmail())
                .businessName(vendor.getBusinessName())
                .businessDescription(vendor.getAddress())
                .status(vendor.isApproved() ? "APPROVED" : "PENDING")
                .totalProducts((int) productCount)
                .totalOrders(orderCount)
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }
}
