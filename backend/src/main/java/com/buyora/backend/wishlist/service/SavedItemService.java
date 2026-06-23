package com.buyora.backend.wishlist.service;

import com.buyora.backend.cart.service.CartService;
import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.review.service.ReviewService;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.wishlist.dto.SavedItemResponse;
import com.buyora.backend.wishlist.entity.SavedItem;
import com.buyora.backend.wishlist.repository.SavedItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedItemService {

    private final SavedItemRepository savedItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public List<SavedItemResponse> getSavedItems(Long userId) {
        return savedItemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SavedItemResponse saveForLater(Long userId, Long productId) {
        cartService.remove(userId, productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = getApprovedProduct(productId);

        SavedItem item = savedItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    SavedItem s = new SavedItem();
                    s.setUser(user);
                    s.setProduct(product);
                    s.setPriceAtSave(product.getPrice());
                    return s;
                });
        item.setPriceAtSave(product.getPrice());
        return toResponse(savedItemRepository.save(item));
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        if (!savedItemRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Saved item", "productId", productId);
        }
        savedItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void moveToCart(Long userId, Long productId) {
        SavedItem item = savedItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved item", "productId", productId));
        cartService.addToCart(userId, productId, 1);
        savedItemRepository.delete(item);
    }

    private Product getApprovedProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        if (product.getStatus() != Product.ProductStatus.APPROVED) {
            throw new IllegalArgumentException("Product not available");
        }
        return product;
    }

    private SavedItemResponse toResponse(SavedItem item) {
        Product product = item.getProduct();
        String imageUrl = product.getImageUrls() != null && !product.getImageUrls().isEmpty()
                ? product.getImageUrls().get(0) : null;
        var rating = reviewService.getProductSummary(product.getId());

        return SavedItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .vendorName(product.getVendor().getBusinessName())
                .imageUrl(imageUrl)
                .currentPrice(product.getPrice())
                .priceAtSave(item.getPriceAtSave())
                .stockStatus(inventoryService.getStockStatus(product).name())
                .availableQuantity(inventoryService.getAvailableQuantity(product))
                .averageRating(rating.getAverageRating())
                .reviewCount((int) rating.getTotalReviews())
                .savedAt(item.getCreatedAt())
                .build();
    }
}
