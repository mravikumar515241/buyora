package com.buyora.backend.marketing.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.marketing.dto.HomepageContentResponse;
import com.buyora.backend.marketing.service.MarketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing")
@RequiredArgsConstructor
public class MarketingController {

    private final MarketingService marketingService;

    @GetMapping("/homepage")
    public ResponseEntity<ApiResponse<HomepageContentResponse>> homepage(
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(ApiResponse.success("Homepage content retrieved",
                marketingService.getPublicHomepageContent(sessionId)));
    }
}
