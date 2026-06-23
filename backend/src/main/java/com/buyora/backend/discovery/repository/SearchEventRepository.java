package com.buyora.backend.discovery.repository;

import com.buyora.backend.discovery.entity.SearchEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchEventRepository extends JpaRepository<SearchEvent, Long> {

    @Query("SELECT se.keyword, COUNT(se) FROM SearchEvent se GROUP BY se.keyword ORDER BY COUNT(se) DESC")
    List<Object[]> findTrendingKeywords(Pageable pageable);

    @Query("SELECT se.keyword, COUNT(se) FROM SearchEvent se WHERE se.resultCount = 0 GROUP BY se.keyword ORDER BY COUNT(se) DESC")
    List<Object[]> findNoResultKeywords(Pageable pageable);

    @Query("SELECT se.keyword, COUNT(se) FROM SearchEvent se WHERE se.converted = true GROUP BY se.keyword ORDER BY COUNT(se) DESC")
    List<Object[]> findTopConvertingKeywords(Pageable pageable);

    @Query("SELECT se.keyword, COUNT(se) FROM SearchEvent se GROUP BY se.keyword ORDER BY COUNT(se) DESC")
    List<Object[]> findMostSearchedKeywords(Pageable pageable);
}
