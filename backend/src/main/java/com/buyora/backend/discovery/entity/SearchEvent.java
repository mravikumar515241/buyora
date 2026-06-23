package com.buyora.backend.discovery.entity;

import com.buyora.backend.common.entity.BaseEntity;
import com.buyora.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "search_events", indexes = {
        @Index(name = "idx_search_events_keyword", columnList = "keyword"),
        @Index(name = "idx_search_events_created", columnList = "created_at")
})
@Getter
@Setter
public class SearchEvent extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Integer resultCount = 0;

    @Column(nullable = false)
    private Boolean converted = false;
}
