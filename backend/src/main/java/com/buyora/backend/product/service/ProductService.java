package com.buyora.backend.product.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.product.dto.ProductRequest;
import com.buyora.backend.product.dto.ProductResponse;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.review.service.ReviewService;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.wishlist.service.WishlistAlertService;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final VendorService vendorService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;
    private final WishlistAlertService wishlistAlertService;

    @Transactional
    public ProductResponse create(Long userId, ProductRequest request) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setReservedQuantity(0);
        product.setCategory(categoryService.getEntityById(request.getCategoryId()));
        product.setVendor(vendor);
        product.setStatus(Product.ProductStatus.PENDING_APPROVAL);
        if (request.getImageUrls() != null) {
            product.setImageUrls(request.getImageUrls());
        }
        if (request.getTags() != null) {
            product.setTags(normalizeTags(request.getTags()));
        }
        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long userId, Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new IllegalArgumentException("Not your product");
        }
        BigDecimal previousPrice = product.getPrice();
        int previousAvailable = inventoryService.getAvailableQuantity(product);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock() != null ? request.getStock() : product.getStock());
        product.setCategory(categoryService.getEntityById(request.getCategoryId()));
        if (request.getImageUrls() != null) product.setImageUrls(request.getImageUrls());
        if (request.getTags() != null) product.setTags(normalizeTags(request.getTags()));
        
        // If product was in MODIFICATION_REQUESTED status, reset to PENDING_APPROVAL
        if (product.getStatus() == Product.ProductStatus.MODIFICATION_REQUESTED) {
            product.setStatus(Product.ProductStatus.PENDING_APPROVAL);
            product.setAdminComments(null);
        }
        
        product = productRepository.save(product);
        wishlistAlertService.checkPriceDrop(product, previousPrice);
        wishlistAlertService.checkBackInStock(product, previousAvailable, inventoryService.getAvailableQuantity(product));
        return toResponse(product);
    }

    public void delete(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new IllegalArgumentException("Not your product");
        }
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAllApproved(Pageable pageable, String search) {
        Page<Product> page = (search != null && !search.isBlank())
                ? productRepository.findAllApprovedByNameContaining(search.trim(), pageable)
                : productRepository.findAllApproved(pageable);
        List<ProductResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findByVendor(Long userId, Pageable pageable) {
        return vendorService.findVendorEntityByUserId(userId)
                .map(v -> {
                    Page<Product> page = productRepository.findByVendorId(v.getId(), pageable);
                    List<ProductResponse> content = page.getContent().stream().map(this::toResponse).toList();
                    return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
                })
                .orElse(new PageImpl<>(List.of(), pageable, 0));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return getApprovedById(id);
    }

    @Transactional(readOnly = true)
    public ProductResponse getApprovedById(Long id) {
        Product product = productRepository.findById(id)
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        ProductResponse response = toPublicResponse(product);
        response.setAverageRating(reviewService.getAverageRating(id));
        response.setReviewCount(reviewService.getReviewCount(id));
        return response;
    }

    public ProductResponse toPublicResponse(Product p) {
        return toResponse(p);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findByCategory(Long categoryId, Pageable pageable, String search) {
        Page<Product> page = (search != null && !search.isBlank())
                ? productRepository.findByCategoryIdAndStatusAndNameContaining(categoryId, search.trim(), Product.ProductStatus.APPROVED, pageable)
                : productRepository.findByCategoryIdAndStatus(categoryId, Product.ProductStatus.APPROVED, pageable);
        List<ProductResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Transactional
    public ProductResponse setStatus(Long productId, Product.ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setStatus(status);
        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findByStatus(Product.ProductStatus status, Pageable pageable) {
        Page<Product> page = productRepository.findByStatus(status, pageable);
        List<ProductResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(Pageable pageable) {
        Page<Product> page = productRepository.findAll(pageable);
        List<ProductResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    @Transactional
    public ProductResponse approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setStatus(Product.ProductStatus.APPROVED);
        product.setAdminComments(null);
        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse rejectProduct(Long productId, String rejectionReason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setStatus(Product.ProductStatus.REJECTED);
        product.setRejectionReason(rejectionReason);
        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse requestModification(Long productId, String comments) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setStatus(Product.ProductStatus.MODIFICATION_REQUESTED);
        product.setAdminComments(comments);
        product = productRepository.save(product);
        return toResponse(product);
    }

    private ProductResponse toResponse(Product p) {
        List<String> urls = p.getImageUrls() != null ? p.getImageUrls() : new ArrayList<>();
        int available = inventoryService.getAvailableQuantity(p);
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .reservedQuantity(inventoryService.getReservedQuantity(p))
                .availableQuantity(available)
                .stockStatus(inventoryService.getStockStatus(p).name())
                .soldQuantity(inventoryService.getSoldQuantity(p))
                .sku(p.getSku())
                .lowStockThreshold(inventoryService.getLowStockThreshold(p))
                .reorderThreshold(p.getReorderThreshold())
                .expectedRestockDate(p.getExpectedRestockDate())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .vendorId(p.getVendor().getId())
                .vendorUserId(p.getVendor().getUser() != null ? p.getVendor().getUser().getId() : null)
                .vendorBusinessName(p.getVendor().getBusinessName())
                .vendorEmail(p.getVendor().getUser() != null ? p.getVendor().getUser().getEmail() : null)
                .status(p.getStatus())
                .imageUrls(urls)
                .tags(p.getTags() != null ? p.getTags() : new ArrayList<>())
                .adminComments(p.getAdminComments())
                .rejectionReason(p.getRejectionReason())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .averageRating(Math.round(reviewService.getAverageRating(p.getId()) * 10.0) / 10.0)
                .reviewCount(reviewService.getReviewCount(p.getId()))
                .build();
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null) return new ArrayList<>();
        return tags.stream()
                .filter(t -> t != null && !t.isBlank())
                .map(String::trim)
                .distinct()
                .limit(20)
                .toList();
    }
}
