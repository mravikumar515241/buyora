package com.buyora.backend.inventory.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.inventory.entity.StockRestockSubscription;
import com.buyora.backend.inventory.repository.StockRestockSubscriptionRepository;
import com.buyora.backend.notification.entity.NotificationCategory;
import com.buyora.backend.notification.entity.NotificationEventType;
import com.buyora.backend.notification.entity.NotificationPriority;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockRestockService {

    private final StockRestockSubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationDispatcher notificationDispatcher;

    @Transactional(readOnly = true)
    public boolean isSubscribed(Long userId, Long productId) {
        return subscriptionRepository.existsByUserIdAndProductIdAndActiveTrue(userId, productId);
    }

    @Transactional
    public void subscribe(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StockRestockSubscription subscription = subscriptionRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    StockRestockSubscription s = new StockRestockSubscription();
                    s.setUser(user);
                    s.setProduct(product);
                    return s;
                });
        subscription.setActive(true);
        subscription.setNotified(false);
        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribe(Long userId, Long productId) {
        subscriptionRepository.findByUserIdAndProductId(userId, productId).ifPresent(s -> {
            s.setActive(false);
            subscriptionRepository.save(s);
        });
    }

    @Transactional
    public void notifySubscribers(Product product, int previousAvailable, int currentAvailable) {
        if (product == null || previousAvailable > 0 || currentAvailable <= 0) {
            return;
        }

        List<StockRestockSubscription> subscriptions =
                subscriptionRepository.findByProductIdAndActiveTrueAndNotifiedFalse(product.getId());

        for (StockRestockSubscription subscription : subscriptions) {
            Long userId = subscription.getUser().getId();
            notificationDispatcher.send(
                    userId,
                    "Back In Stock",
                    product.getName() + " is back in stock. Order now before it sells out.",
                    NotificationCategory.PROMOTION,
                    NotificationEventType.BACK_IN_STOCK,
                    NotificationPriority.HIGH,
                    "/products/" + product.getId());
            subscription.setNotified(true);
            subscriptionRepository.save(subscription);
        }

        if (!subscriptions.isEmpty()) {
            log.info("Notified {} restock subscribers for product {}", subscriptions.size(), product.getId());
        }
    }
}
