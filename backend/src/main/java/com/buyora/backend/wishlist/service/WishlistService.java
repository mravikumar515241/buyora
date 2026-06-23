package com.buyora.backend.wishlist.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.review.service.ReviewService;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.service.VendorService;
import com.buyora.backend.wishlist.dto.*;
import com.buyora.backend.wishlist.entity.WishlistCollection;
import com.buyora.backend.wishlist.entity.WishlistItem;
import com.buyora.backend.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistCollectionService collectionService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final VendorService vendorService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(Long userId, Long collectionId, String search, Pageable pageable) {
        WishlistCollection collection = collectionService.getOwnedCollection(userId, collectionId);
        List<WishlistItem> items = wishlistRepository.findByCollectionIdOrderByCreatedAtDesc(collection.getId());
        List<WishlistItemResponse> responses = items.stream()
                .map(this::toResponse)
                .filter(r -> matchesSearch(r, search))
                .toList();
        return paginate(responses, pageable);
    }

    @Transactional(readOnly = true)
    public WishlistResponse getAllWishlistItems(Long userId, String search, Pageable pageable) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<WishlistItemResponse> responses = items.stream()
                .map(this::toResponse)
                .filter(r -> matchesSearch(r, search))
                .toList();
        return paginate(responses, pageable);
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getRecent(Long userId, int limit) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional(readOnly = true)
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }

    @Transactional
    public WishlistItemResponse addToWishlist(Long userId, Long productId, Long collectionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = getApprovedProduct(productId);
        WishlistCollection collection = collectionService.resolveCollection(userId, collectionId);

        if (wishlistRepository.existsByCollectionIdAndProductId(collection.getId(), productId)) {
            return wishlistRepository.findByCollectionIdAndProductId(collection.getId(), productId)
                    .map(this::toResponse)
                    .orElseThrow();
        }

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("Product is already in another wishlist. Move it instead.");
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setCollection(collection);
        item.setProduct(product);
        item.setPriceAtAdd(product.getPrice());
        item = wishlistRepository.save(item);
        return toResponse(item);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Wishlist item", "productId", productId);
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public WishlistToggleResponse toggleWishlist(Long userId, Long productId, Long collectionId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return WishlistToggleResponse.builder()
                    .wishlisted(false)
                    .wishlistCount(wishlistRepository.countByUserId(userId))
                    .build();
        }
        addToWishlist(userId, productId, collectionId);
        return WishlistToggleResponse.builder()
                .wishlisted(true)
                .wishlistCount(wishlistRepository.countByUserId(userId))
                .build();
    }

    @Transactional
    public WishlistItemResponse moveToCollection(Long userId, Long productId, Long targetCollectionId) {
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item", "productId", productId));
        WishlistCollection target = collectionService.getOwnedCollection(userId, targetCollectionId);
        if (wishlistRepository.existsByCollectionIdAndProductId(target.getId(), productId)
                && !target.getId().equals(item.getCollection().getId())) {
            throw new IllegalArgumentException("Product already exists in target wishlist");
        }
        item.setCollection(target);
        return toResponse(wishlistRepository.save(item));
    }

    @Transactional(readOnly = true)
    public WishlistResponse getSharedWishlist(String shareToken, Pageable pageable) {
        WishlistCollection collection = collectionService.getSharedCollectionEntity(shareToken);
        List<WishlistItem> items = wishlistRepository.findByCollectionIdOrderByCreatedAtDesc(collection.getId());
        List<WishlistItemResponse> responses = items.stream().map(this::toResponse).toList();
        return paginate(responses, pageable);
    }

    @Transactional(readOnly = true)
    public List<TopWishlistedProductResponse> getTopWishlistedProducts(int limit) {
        List<Object[]> rows = wishlistRepository.findTopWishlistedProducts(PageRequest.of(0, limit));
        List<TopWishlistedProductResponse> results = new ArrayList<>();
        for (Object[] row : rows) {
            results.add(TopWishlistedProductResponse.builder()
                    .productId((Long) row[0])
                    .productName((String) row[1])
                    .wishlistCount((Long) row[2])
                    .build());
        }
        return results;
    }

    @Transactional(readOnly = true)
    public WishlistAnalyticsResponse getAnalytics() {
        long totalItems = wishlistRepository.count();
        long totalCollections = collectionService.countAllCollections();
        LocalDateTime now = LocalDateTime.now();
        long last30 = wishlistRepository.countAddedSince(now.minusDays(30));
        long prev30 = wishlistRepository.countAddedSince(now.minusDays(60)) - last30;
        double growth = prev30 > 0 ? ((last30 - prev30) * 100.0 / prev30) : (last30 > 0 ? 100.0 : 0.0);

        List<CategoryWishlistStatResponse> categories = new ArrayList<>();
        for (Object[] row : wishlistRepository.countByCategory(PageRequest.of(0, 8))) {
            categories.add(CategoryWishlistStatResponse.builder()
                    .categoryId((Long) row[0])
                    .categoryName((String) row[1])
                    .wishlistCount((Long) row[2])
                    .build());
        }

        return WishlistAnalyticsResponse.builder()
                .totalWishlistItems(totalItems)
                .totalCollections(totalCollections)
                .itemsAddedLast30Days(last30)
                .itemsAddedPrevious30Days(prev30)
                .growthPercent(Math.round(growth * 10.0) / 10.0)
                .topProducts(getTopWishlistedProducts(10))
                .topCategories(categories)
                .build();
    }

    @Transactional(readOnly = true)
    public List<VendorWishlistStatResponse> getVendorWishlistStats(Long userId) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        List<Object[]> rows = wishlistRepository.countByVendorProducts(vendor.getId());
        Map<Long, Long> countMap = rows.stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        return productRepository.findByVendorId(vendor.getId(), PageRequest.of(0, 1000)).getContent()
                .stream()
                .map(p -> VendorWishlistStatResponse.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .wishlistCount(countMap.getOrDefault(p.getId(), 0L))
                        .build())
                .sorted((a, b) -> Long.compare(b.getWishlistCount(), a.getWishlistCount()))
                .toList();
    }

    private Product getApprovedProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        if (product.getStatus() != Product.ProductStatus.APPROVED) {
            throw new IllegalArgumentException("Product not available");
        }
        return product;
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        Product product = item.getProduct();
        BigDecimal currentPrice = product.getPrice();
        BigDecimal priceAtAdd = item.getPriceAtAdd();
        boolean priceChanged = priceAtAdd != null && currentPrice != null
                && currentPrice.compareTo(priceAtAdd) != 0;

        BigDecimal discountAmount = BigDecimal.ZERO;
        int discountPercent = 0;
        if (priceChanged && currentPrice.compareTo(priceAtAdd) < 0) {
            discountAmount = priceAtAdd.subtract(currentPrice).setScale(2, RoundingMode.HALF_UP);
            if (priceAtAdd.compareTo(BigDecimal.ZERO) > 0) {
                discountPercent = discountAmount
                        .multiply(BigDecimal.valueOf(100))
                        .divide(priceAtAdd, 0, RoundingMode.HALF_UP)
                        .intValue();
            }
        }

        String imageUrl = null;
        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            imageUrl = product.getImageUrls().get(0);
        }

        var rating = reviewService.getProductSummary(product.getId());

        return WishlistItemResponse.builder()
                .id(item.getId())
                .collectionId(item.getCollection().getId())
                .collectionName(item.getCollection().getName())
                .productId(product.getId())
                .productName(product.getName())
                .vendorName(product.getVendor().getBusinessName())
                .imageUrl(imageUrl)
                .currentPrice(currentPrice)
                .priceAtAdd(priceAtAdd)
                .priceChanged(priceChanged)
                .discountAmount(discountAmount)
                .discountPercent(discountPercent)
                .stockStatus(inventoryService.getStockStatus(product).name())
                .availableQuantity(inventoryService.getAvailableQuantity(product))
                .averageRating(rating.getAverageRating())
                .reviewCount((int) rating.getTotalReviews())
                .addedAt(item.getCreatedAt())
                .build();
    }

    private boolean matchesSearch(WishlistItemResponse item, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.trim().toLowerCase(Locale.ROOT);
        return (item.getProductName() != null && item.getProductName().toLowerCase(Locale.ROOT).contains(q))
                || (item.getVendorName() != null && item.getVendorName().toLowerCase(Locale.ROOT).contains(q))
                || (item.getCollectionName() != null && item.getCollectionName().toLowerCase(Locale.ROOT).contains(q));
    }

    private WishlistResponse paginate(List<WishlistItemResponse> items, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        List<WishlistItemResponse> pageContent = start >= items.size() ? List.of() : items.subList(start, end);
        Page<WishlistItemResponse> page = new PageImpl<>(pageContent, pageable, items.size());
        return WishlistResponse.builder()
                .items(page.getContent())
                .totalCount(page.getTotalElements())
                .build();
    }
}
