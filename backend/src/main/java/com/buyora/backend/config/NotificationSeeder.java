package com.buyora.backend.config;

import com.buyora.backend.notification.entity.*;
import com.buyora.backend.notification.repository.NotificationRepository;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(6)
@RequiredArgsConstructor
public class NotificationSeeder implements CommandLineRunner {

    private final NotificationRepository notificationRepository;
    private final NotificationDispatcher dispatcher;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() > 0) return;

        userRepository.findAll().stream().findFirst().ifPresent(user -> {
            dispatcher.send(user.getId(),
                    "Welcome to Buyora",
                    "Your account is ready. Start exploring deals and track orders here.",
                    NotificationCategory.ACCOUNT,
                    NotificationEventType.ACCOUNT_CREATED,
                    NotificationPriority.MEDIUM,
                    "/products");

            dispatcher.send(user.getId(),
                    "New Coupon Available",
                    "Use code WELCOME10 for 10% off your first order.",
                    NotificationCategory.PROMOTION,
                    NotificationEventType.COUPON_RECEIVED,
                    NotificationPriority.LOW,
                    "/offers");

            dispatcher.send(user.getId(),
                    "Flash Sale Live",
                    "Lightning deals are live now. Limited stock — shop before they are gone.",
                    NotificationCategory.PROMOTION,
                    NotificationEventType.FLASH_SALE,
                    NotificationPriority.HIGH,
                    "/offers?type=flash");
        });
    }
}
