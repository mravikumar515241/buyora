package com.buyora.backend.marketing.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomepageContentResponse {
    private List<AnnouncementResponse> announcements;
    private List<HomepageSectionView> sections;
}
