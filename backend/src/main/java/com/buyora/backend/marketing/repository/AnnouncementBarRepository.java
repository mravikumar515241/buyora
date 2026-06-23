package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.AnnouncementBar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementBarRepository extends JpaRepository<AnnouncementBar, Long> {
    List<AnnouncementBar> findByActiveTrueOrderByPriorityAsc();
}
