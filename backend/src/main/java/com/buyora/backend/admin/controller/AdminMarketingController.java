package com.buyora.backend.admin.controller;

import com.buyora.backend.common.dto.ApiResponse;
import com.buyora.backend.marketing.dto.*;
import com.buyora.backend.marketing.service.MarketingService;
import com.buyora.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/marketing")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMarketingController {

    private final MarketingService marketingService;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<MarketingAnalyticsResponse>> analytics() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.getAnalytics()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> auditLogs(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(marketingService.getAuditLogs(pageable)));
    }

    // Banners
    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> listBanners() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listBanners()));
    }

    @PostMapping("/banners")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@RequestBody BannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Banner created", marketingService.createBanner(request)));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(@PathVariable Long id, @RequestBody BannerRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Banner updated", marketingService.updateBanner(id, request)));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        marketingService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted", null));
    }

    @PutMapping("/banners/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderBanners(@RequestBody ReorderRequest request) {
        marketingService.reorderBanners(request);
        return ResponseEntity.ok(ApiResponse.success("Banners reordered", null));
    }

    // Campaigns
    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> listCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listCampaigns()));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(@RequestBody CampaignRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Campaign created", marketingService.createCampaign(request)));
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<CampaignResponse>> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Campaign updated", marketingService.updateCampaign(id, request)));
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(@PathVariable Long id) {
        marketingService.deleteCampaign(id);
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted", null));
    }

    // Flash sales
    @GetMapping("/flash-sales")
    public ResponseEntity<ApiResponse<List<FlashSaleResponse>>> listFlashSales() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listFlashSales()));
    }

    @PostMapping("/flash-sales")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> createFlashSale(@RequestBody FlashSaleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Flash sale created", marketingService.createFlashSale(request)));
    }

    @PutMapping("/flash-sales/{id}")
    public ResponseEntity<ApiResponse<FlashSaleResponse>> updateFlashSale(@PathVariable Long id, @RequestBody FlashSaleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Flash sale updated", marketingService.updateFlashSale(id, request)));
    }

    @DeleteMapping("/flash-sales/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFlashSale(@PathVariable Long id) {
        marketingService.deleteFlashSale(id);
        return ResponseEntity.ok(ApiResponse.success("Flash sale deleted", null));
    }

    // Homepage sections
    @GetMapping("/homepage-sections")
    public ResponseEntity<ApiResponse<List<HomepageSectionResponse>>> listSections() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listSections()));
    }

    @PutMapping("/homepage-sections")
    public ResponseEntity<ApiResponse<List<HomepageSectionResponse>>> updateSections(@RequestBody HomepageSectionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Sections updated", marketingService.updateSections(request)));
    }

    // Announcements
    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> listAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listAnnouncements()));
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(@RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement created", marketingService.createAnnouncement(request)));
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(@PathVariable Long id, @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", marketingService.updateAnnouncement(id, request)));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        marketingService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted", null));
    }

    // Media
    @GetMapping("/media")
    public ResponseEntity<ApiResponse<List<MediaAssetResponse>>> listMedia() {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listMedia()));
    }

    @PostMapping("/media")
    public ResponseEntity<ApiResponse<MediaAssetResponse>> createMedia(
            @RequestBody MediaAssetRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(ApiResponse.success("Media saved", marketingService.createMedia(request, userId)));
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable Long id) {
        marketingService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success("Media deleted", null));
    }

    // Vendor promotions
    @GetMapping("/vendor-promotions")
    public ResponseEntity<ApiResponse<List<VendorPromotionResponse>>> listVendorPromotions(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(marketingService.listVendorPromotions(status)));
    }

    @PutMapping("/vendor-promotions/{id}/review")
    public ResponseEntity<ApiResponse<VendorPromotionResponse>> reviewVendorPromotion(
            @PathVariable Long id,
            @RequestBody VendorPromotionActionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Promotion reviewed", marketingService.reviewVendorPromotion(id, request)));
    }
}
