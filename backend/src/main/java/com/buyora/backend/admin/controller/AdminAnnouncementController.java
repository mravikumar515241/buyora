package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.notification.dto.PlatformAnnouncementRequest;
import com.buyora.backend.notification.dto.PlatformAnnouncementResponse;
import com.buyora.backend.notification.service.PlatformAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnnouncementController {

    private final PlatformAnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlatformAnnouncementResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(announcementService.listAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlatformAnnouncementResponse>> create(@RequestBody PlatformAnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement created", announcementService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlatformAnnouncementResponse>> update(
            @PathVariable Long id, @RequestBody PlatformAnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", announcementService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted", null));
    }
}
