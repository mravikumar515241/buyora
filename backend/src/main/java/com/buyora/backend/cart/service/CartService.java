package com.buyora.backend.cart.service;

import com.buyora.backend.cart.dto.CartItemResponse;
import com.buyora.backend.cart.dto.CartResponse;
import com.buyora.backend.cart.entity.CartItem;
import com.buyora.backend.cart.repository.CartItemRepository;
import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional
    public CartItemResponse addToCart(Long userId, Long productId, int quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        
        if (product.getStatus() != Product.ProductStatus.APPROVED) {
            throw new IllegalArgumentException("Product not available");
        }
        
        // Prevent vendors from buying their own products
        // Compare the product's vendor's user ID with the current user ID
        if (product.getVendor() != null && 
            product.getVendor().getUser() != null && 
            product.getVendor().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot purchase your own products");
        }
        
        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId).orElse(null);
        int newQuantity = item == null ? quantity : item.getQuantity() + quantity;
        inventoryService.validateAvailableStock(productId, newQuantity);

        if (item == null) {
            item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(quantity);
        } else {
            item.setQuantity(item.getQuantity() + quantity);
        }
        item = cartItemRepository.save(item);
        return toItemResponse(item);
    }

    @Transactional
    public void updateQuantity(Long userId, Long productId, int quantity) {
        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "productId", productId));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return;
        }
        inventoryService.validateAvailableStock(productId, quantity);
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        cartItemRepository.findByUserIdAndProductId(userId, productId).ifPresent(cartItemRepository::delete);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        List<CartItemResponse> list = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            CartItemResponse r = toItemResponse(item);
            list.add(r);
            total = total.add(r.getSubtotal());
        }
        return CartResponse.builder().items(list).totalAmount(total).build();
    }

    @Transactional
    public void clearCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        cartItemRepository.deleteAll(items);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        BigDecimal price = item.getProduct().getPrice();
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
        
        // Get the first image URL from product's imageUrls list
        String imageUrl = null;
        if (item.getProduct().getImageUrls() != null && !item.getProduct().getImageUrls().isEmpty()) {
            imageUrl = item.getProduct().getImageUrls().get(0);
        }
        
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .imageUrl(imageUrl)
                .quantity(item.getQuantity())
                .unitPrice(price)
                .subtotal(subtotal)
                .build();
    }
}
