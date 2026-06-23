package com.buyora.backend.notification.repository;

import com.buyora.backend.notification.entity.Notification;
import com.buyora.backend.notification.entity.NotificationCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndDeletedFalseAndReadOrderByCreatedAtDesc(Long userId, boolean read, Pageable pageable);

    Page<Notification> findByUserIdAndDeletedFalseAndCategoryOrderByCreatedAtDesc(
            Long userId, NotificationCategory category, Pageable pageable);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.userId = :userId AND n.deleted = false
            AND (:read IS NULL OR n.read = :read)
            AND (:category IS NULL OR n.category = :category)
            AND (:search IS NULL OR :search = '' OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> searchNotifications(
            @Param("userId") Long userId,
            @Param("read") Boolean read,
            @Param("category") NotificationCategory category,
            @Param("search") String search,
            Pageable pageable);

    long countByUserIdAndReadFalseAndDeletedFalseAndEnabledTrue(Long userId);

    List<Notification> findTop10ByUserIdAndDeletedFalseAndEnabledTrueOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.deleted = false AND n.read = false")
    int markAllRead(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.deleted = true WHERE n.userId = :userId AND n.deleted = false")
    int softDeleteAll(@Param("userId") Long userId);
}
