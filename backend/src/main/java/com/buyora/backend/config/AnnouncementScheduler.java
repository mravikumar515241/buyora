package com.buyora.backend.config;

import com.buyora.backend.notification.service.PlatformAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AnnouncementScheduler {

    private final PlatformAnnouncementService announcementService;

    @Scheduled(fixedRate = 60_000)
    public void processAnnouncements() {
        announcementService.processScheduled();
    }
}
