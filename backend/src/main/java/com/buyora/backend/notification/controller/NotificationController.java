package com.buyora.backend.notification.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.notification.dto.*;
import com.buyora.backend.notification.entity.NotificationCategory;
import com.buyora.backend.notification.service.NotificationService;
import com.buyora.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) NotificationCategory category,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.list(principal.getUserId(), read, category, search, pageable)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> recent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.recent(principal.getUserId(), limit)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> unreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.unreadCount(principal.getUserId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        notificationService.markRead(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllRead(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        notificationService.delete(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAll(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.clearAll(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("All notifications cleared", null));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getPreferences(principal.getUserId())));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody NotificationPreferenceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Preferences updated", notificationService.updatePreferences(principal.getUserId(), request)));
    }
}
