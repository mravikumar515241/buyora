package com.buyora.backend.notification.repository;

import com.buyora.backend.notification.entity.PlatformAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PlatformAnnouncementRepository extends JpaRepository<PlatformAnnouncement, Long> {
    List<PlatformAnnouncement> findAllByOrderByCreatedAtDesc();

    List<PlatformAnnouncement> findByActiveTrueAndStartDateBeforeAndEndDateAfter(
            LocalDateTime now1, LocalDateTime now2);

    List<PlatformAnnouncement> findByActiveTrueAndDispatchedFalseAndStartDateBefore(LocalDateTime now);
}
