package com.buyora.backend.discovery.repository;

import com.buyora.backend.discovery.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<SearchHistory> findByUserIdAndKeywordIgnoreCase(Long userId, String keyword);

    void deleteByUserId(Long userId);
}
