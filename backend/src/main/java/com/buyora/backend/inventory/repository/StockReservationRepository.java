package com.buyora.backend.inventory.repository;

import com.buyora.backend.inventory.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {

    List<StockReservation> findByOrderIdAndStatus(Long orderId, StockReservation.ReservationStatus status);

    List<StockReservation> findByStatusAndExpiresAtBefore(
            StockReservation.ReservationStatus status, LocalDateTime expiresAt);
}
