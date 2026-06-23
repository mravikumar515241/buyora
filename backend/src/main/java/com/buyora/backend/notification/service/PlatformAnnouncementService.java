package com.buyora.backend.notification.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.notification.dto.PlatformAnnouncementRequest;
import com.buyora.backend.notification.dto.PlatformAnnouncementResponse;
import com.buyora.backend.notification.entity.PlatformAnnouncement;
import com.buyora.backend.notification.repository.PlatformAnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformAnnouncementService {

    private final PlatformAnnouncementRepository repository;
    private final NotificationDispatcher dispatcher;

    @Transactional(readOnly = true)
    public List<PlatformAnnouncementResponse> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PlatformAnnouncementResponse create(PlatformAnnouncementRequest request) {
        PlatformAnnouncement a = map(new PlatformAnnouncement(), request);
        a = repository.save(a);
        maybeDispatch(a);
        return toResponse(a);
    }

    @Transactional
    public PlatformAnnouncementResponse update(Long id, PlatformAnnouncementRequest request) {
        PlatformAnnouncement a = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        a = map(a, request);
        a = repository.save(a);
        return toResponse(a);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public void processScheduled() {
        LocalDateTime now = LocalDateTime.now();
        for (PlatformAnnouncement a : repository.findAll()) {
            if (a.getStartDate() != null && now.isBefore(a.getStartDate())) {
                if (a.isActive()) {
                    a.setActive(false);
                    repository.save(a);
                }
                continue;
            }
            if (a.getEndDate() != null && now.isAfter(a.getEndDate())) {
                if (a.isActive()) {
                    a.setActive(false);
                    repository.save(a);
                }
                continue;
            }
            if (a.getStartDate() != null && !a.isActive() && !now.isBefore(a.getStartDate())
                    && (a.getEndDate() == null || !now.isAfter(a.getEndDate()))) {
                a.setActive(true);
                repository.save(a);
            }
            if (a.isActive() && !a.isDispatched()
                    && (a.getStartDate() == null || !now.isBefore(a.getStartDate()))) {
                dispatcher.dispatchAnnouncement(a);
                a.setDispatched(true);
                repository.save(a);
            }
        }
    }

    private void maybeDispatch(PlatformAnnouncement a) {
        LocalDateTime now = LocalDateTime.now();
        boolean inWindow = (a.getStartDate() == null || !now.isBefore(a.getStartDate()))
                && (a.getEndDate() == null || !now.isAfter(a.getEndDate()));
        if (a.isActive() && inWindow && !a.isDispatched()) {
            dispatcher.dispatchAnnouncement(a);
            a.setDispatched(true);
            repository.save(a);
        }
    }

    private PlatformAnnouncement map(PlatformAnnouncement a, PlatformAnnouncementRequest r) {
        if (r.getTitle() != null) a.setTitle(r.getTitle());
        if (r.getDescription() != null) a.setDescription(r.getDescription());
        if (r.getBannerImageUrl() != null) a.setBannerImageUrl(r.getBannerImageUrl());
        if (r.getPriority() != null) a.setPriority(r.getPriority());
        if (r.getAudience() != null) a.setAudience(r.getAudience());
        a.setTargetUserId(r.getTargetUserId());
        a.setTargetVendorId(r.getTargetVendorId());
        if (r.getStartDate() != null) a.setStartDate(r.getStartDate());
        if (r.getEndDate() != null) a.setEndDate(r.getEndDate());
        if (r.getActive() != null) a.setActive(r.getActive());
        return a;
    }

    private PlatformAnnouncementResponse toResponse(PlatformAnnouncement a) {
        return PlatformAnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .bannerImageUrl(a.getBannerImageUrl())
                .priority(a.getPriority())
                .audience(a.getAudience())
                .targetUserId(a.getTargetUserId())
                .targetVendorId(a.getTargetVendorId())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .active(a.isActive())
                .dispatched(a.isDispatched())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
