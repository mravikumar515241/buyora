package com.buyora.backend.config;

import com.buyora.backend.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryReservationScheduler {

    private final InventoryService inventoryService;

    @Scheduled(fixedRate = 60000)
    public void releaseExpiredReservations() {
        try {
            inventoryService.releaseExpiredReservations();
        } catch (Exception e) {
            log.error("Error releasing expired stock reservations", e);
        }
    }
}
