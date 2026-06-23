package com.buyora.backend.marketing.repository;

import com.buyora.backend.marketing.entity.HomepageSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HomepageSectionRepository extends JpaRepository<HomepageSection, Long> {
    List<HomepageSection> findAllByOrderBySortOrderAsc();
    Optional<HomepageSection> findBySectionKey(String sectionKey);
}
