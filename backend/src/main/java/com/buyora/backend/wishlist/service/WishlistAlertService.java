package com.buyora.backend.wishlist.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.notification.entity.NotificationCategory;
import com.buyora.backend.notification.entity.NotificationEventType;
import com.buyora.backend.notification.entity.NotificationPriority;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.wishlist.entity.WishlistItem;
import com.buyora.backend.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistAlertService {

    private final WishlistRepository wishlistRepository;
    private final NotificationDispatcher notificationDispatcher;

    @Transactional
    public void checkPriceDrop(Product product, BigDecimal previousPrice) {
        if (product == null || previousPrice == null || product.getPrice() == null) return;
        if (product.getPrice().compareTo(previousPrice) >= 0) return;

        BigDecimal drop = previousPrice.subtract(product.getPrice()).setScale(2, RoundingMode.HALF_UP);
        int percent = 0;
        if (previousPrice.compareTo(BigDecimal.ZERO) > 0) {
            percent = drop.multiply(BigDecimal.valueOf(100))
                    .divide(previousPrice, 0, RoundingMode.HALF_UP).intValue();
        }

        String message = product.getName() + " dropped from ₹" + formatPrice(previousPrice)
                + " to ₹" + formatPrice(product.getPrice())
                + (percent > 0 ? " (" + percent + "% off)" : "");

        notifyWishlisters(product, "Price Dropped", message,
                NotificationEventType.PRICE_DROP, NotificationPriority.MEDIUM,
                "/products/" + product.getId());
    }

    @Transactional
    public void checkBackInStock(Product product, int previousAvailable, int currentAvailable) {
        if (product == null || previousAvailable > 0 || currentAvailable <= 0) return;

        String message = product.getName() + " is back in stock. Grab it before it sells out again.";

        notifyWishlisters(product, "Back In Stock", message,
                NotificationEventType.WISHLIST_LOW_STOCK, NotificationPriority.HIGH,
                "/products/" + product.getId());
    }

    private void notifyWishlisters(Product product, String title, String message,
                                   NotificationEventType eventType, NotificationPriority priority,
                                   String actionUrl) {
        Set<Long> userIds = new HashSet<>();
        for (WishlistItem item : wishlistRepository.findByProductId(product.getId())) {
            if (item.getUser() != null) {
                userIds.add(item.getUser().getId());
            }
        }
        for (Long userId : userIds) {
            notificationDispatcher.send(userId, title, message,
                    NotificationCategory.PROMOTION, eventType, priority, actionUrl);
        }
        if (!userIds.isEmpty()) {
            log.info("Sent {} alerts for product {} to {} users", title, product.getId(), userIds.size());
        }
    }

    private String formatPrice(BigDecimal price) {
        return price.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }
}
