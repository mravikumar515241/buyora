package com.buyora.backend.marketing.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.coupon.repository.CouponRepository;
import com.buyora.backend.marketing.dto.*;
import com.buyora.backend.marketing.entity.*;
import com.buyora.backend.marketing.repository.*;
import com.buyora.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketingService {

    private final MarketingBannerRepository bannerRepository;
    private final MarketingCampaignRepository campaignRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final HomepageSectionRepository sectionRepository;
    private final AnnouncementBarRepository announcementRepository;
    private final MediaAssetRepository mediaRepository;
    private final MarketingAuditLogRepository auditLogRepository;
    private final VendorPromotionRequestRepository vendorPromotionRepository;
    private final CouponRepository couponRepository;
    private final HomepageContentResolver homepageContentResolver;

    @Transactional(readOnly = true)
    public HomepageContentResponse getPublicHomepageContent(String sessionId) {
        return homepageContentResolver.resolve(sessionId);
    }

    // --- Banners ---
    @Transactional(readOnly = true)
    public List<BannerResponse> listBanners() {
        return bannerRepository.findAllByOrderByPriorityAsc().stream().map(this::toBannerResponse).collect(Collectors.toList());
    }

    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        MarketingBanner banner = mapBanner(new MarketingBanner(), request);
        banner = bannerRepository.save(banner);
        audit("BANNER", banner.getId(), "CREATE", "Created banner: " + banner.getTitle());
        return toBannerResponse(banner);
    }

    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        MarketingBanner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        mapBanner(banner, request);
        banner = bannerRepository.save(banner);
        audit("BANNER", id, "UPDATE", "Updated banner: " + banner.getTitle());
        return toBannerResponse(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        MarketingBanner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        bannerRepository.delete(banner);
        audit("BANNER", id, "DELETE", "Deleted banner: " + banner.getTitle());
    }

    @Transactional
    public void reorderBanners(ReorderRequest request) {
        if (request.getOrderedIds() == null) return;
        int priority = 0;
        for (Long id : request.getOrderedIds()) {
            final int order = priority;
            bannerRepository.findById(id).ifPresent(b -> {
                b.setPriority(order);
                bannerRepository.save(b);
            });
            priority++;
        }
        audit("BANNER", null, "REORDER", "Reordered " + request.getOrderedIds().size() + " banners");
    }

    // --- Campaigns ---
    @Transactional(readOnly = true)
    public List<CampaignResponse> listCampaigns() {
        return campaignRepository.findAll().stream().map(this::toCampaignResponse).collect(Collectors.toList());
    }

    @Transactional
    public CampaignResponse createCampaign(CampaignRequest request) {
        MarketingCampaign c = mapCampaign(new MarketingCampaign(), request);
        c = campaignRepository.save(c);
        audit("CAMPAIGN", c.getId(), "CREATE", "Created campaign: " + c.getName());
        return toCampaignResponse(c);
    }

    @Transactional
    public CampaignResponse updateCampaign(Long id, CampaignRequest request) {
        MarketingCampaign c = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));
        mapCampaign(c, request);
        c = campaignRepository.save(c);
        audit("CAMPAIGN", id, "UPDATE", "Updated campaign: " + c.getName());
        return toCampaignResponse(c);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        MarketingCampaign c = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", "id", id));
        campaignRepository.delete(c);
        audit("CAMPAIGN", id, "DELETE", "Deleted campaign: " + c.getName());
    }

    // --- Flash Sales ---
    @Transactional(readOnly = true)
    public List<FlashSaleResponse> listFlashSales() {
        return flashSaleRepository.findAll().stream().map(this::toFlashSaleResponse).collect(Collectors.toList());
    }

    @Transactional
    public FlashSaleResponse createFlashSale(FlashSaleRequest request) {
        FlashSale sale = mapFlashSale(new FlashSale(), request);
        sale = flashSaleRepository.save(sale);
        audit("FLASH_SALE", sale.getId(), "CREATE", "Created flash sale: " + sale.getTitle());
        return toFlashSaleResponse(sale);
    }

    @Transactional
    public FlashSaleResponse updateFlashSale(Long id, FlashSaleRequest request) {
        FlashSale sale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));
        sale.getItems().clear();
        mapFlashSale(sale, request);
        sale = flashSaleRepository.save(sale);
        audit("FLASH_SALE", id, "UPDATE", "Updated flash sale: " + sale.getTitle());
        return toFlashSaleResponse(sale);
    }

    @Transactional
    public void deleteFlashSale(Long id) {
        FlashSale sale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlashSale", "id", id));
        flashSaleRepository.delete(sale);
        audit("FLASH_SALE", id, "DELETE", "Deleted flash sale: " + sale.getTitle());
    }

    // --- Homepage Sections ---
    @Transactional(readOnly = true)
    public List<HomepageSectionResponse> listSections() {
        return sectionRepository.findAllByOrderBySortOrderAsc().stream().map(this::toSectionResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<HomepageSectionResponse> updateSections(HomepageSectionUpdateRequest request) {
        if (request.getSections() == null) return listSections();
        for (HomepageSectionResponse s : request.getSections()) {
            sectionRepository.findBySectionKey(s.getSectionKey()).ifPresent(entity -> {
                entity.setVisible(s.isVisible());
                entity.setSortOrder(s.getSortOrder());
                if (s.getDisplayLimit() != null) entity.setDisplayLimit(s.getDisplayLimit());
                if (s.getLabel() != null) entity.setLabel(s.getLabel());
                if (s.getSubtitle() != null) entity.setSubtitle(s.getSubtitle());
                entity.setProductIds(s.getProductIds());
                if (s.getConfigJson() != null) entity.setConfigJson(s.getConfigJson());
                if (s.getSectionType() != null) entity.setSectionType(s.getSectionType());
                sectionRepository.save(entity);
            });
        }
        audit("HOMEPAGE_SECTION", null, "UPDATE", "Updated homepage section configuration");
        return listSections();
    }

    // --- Announcements ---
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listAnnouncements() {
        return announcementRepository.findAll().stream().map(this::toAnnouncementResponse).collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request) {
        AnnouncementBar bar = mapAnnouncement(new AnnouncementBar(), request);
        bar = announcementRepository.save(bar);
        audit("ANNOUNCEMENT", bar.getId(), "CREATE", "Created announcement");
        return toAnnouncementResponse(bar);
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request) {
        AnnouncementBar bar = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        mapAnnouncement(bar, request);
        bar = announcementRepository.save(bar);
        audit("ANNOUNCEMENT", id, "UPDATE", "Updated announcement");
        return toAnnouncementResponse(bar);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
        audit("ANNOUNCEMENT", id, "DELETE", "Deleted announcement");
    }

    // --- Media ---
    @Transactional(readOnly = true)
    public List<MediaAssetResponse> listMedia() {
        return mediaRepository.findAll().stream().map(this::toMediaResponse).collect(Collectors.toList());
    }

    @Transactional
    public MediaAssetResponse createMedia(MediaAssetRequest request, Long userId) {
        MediaAsset asset = new MediaAsset();
        asset.setName(request.getName());
        asset.setUrl(request.getUrl());
        if (request.getMediaType() != null) {
            asset.setMediaType(MediaAsset.MediaType.valueOf(request.getMediaType()));
        }
        asset.setUploadedByUserId(userId);
        asset = mediaRepository.save(asset);
        audit("MEDIA", asset.getId(), "CREATE", "Uploaded media: " + asset.getName());
        return toMediaResponse(asset);
    }

    @Transactional
    public void deleteMedia(Long id) {
        mediaRepository.deleteById(id);
        audit("MEDIA", id, "DELETE", "Deleted media asset");
    }

    // --- Vendor Promotions ---
    @Transactional(readOnly = true)
    public List<VendorPromotionResponse> listVendorPromotions(String status) {
        if (status != null && !status.isBlank()) {
            VendorPromotionRequest.RequestStatus s = VendorPromotionRequest.RequestStatus.valueOf(status.toUpperCase());
            return vendorPromotionRepository.findByStatusOrderByCreatedAtDesc(s).stream()
                    .map(this::toVendorPromotionResponse).collect(Collectors.toList());
        }
        return vendorPromotionRepository.findAll().stream().map(this::toVendorPromotionResponse).collect(Collectors.toList());
    }

    @Transactional
    public VendorPromotionResponse reviewVendorPromotion(Long id, VendorPromotionActionRequest request) {
        VendorPromotionRequest req = vendorPromotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorPromotion", "id", id));
        req.setStatus(request.getStatus());
        req.setAdminNotes(request.getAdminNotes());
        req = vendorPromotionRepository.save(req);
        audit("VENDOR_PROMOTION", id, request.getStatus().name(), "Reviewed vendor promotion");
        return toVendorPromotionResponse(req);
    }

    // --- Analytics & Audit ---
    @Transactional(readOnly = true)
    public MarketingAnalyticsResponse getAnalytics() {
        long couponRedemptions = couponRepository.findAll().stream()
                .mapToLong(c -> c.getUsedCount() != null ? c.getUsedCount() : 0).sum();
        return MarketingAnalyticsResponse.builder()
                .totalBanners(bannerRepository.count())
                .activeBanners(bannerRepository.countByActiveTrue())
                .totalCampaigns(campaignRepository.count())
                .activeCampaigns(campaignRepository.countByStatus(MarketingCampaign.CampaignStatus.ACTIVE))
                .totalCoupons(couponRepository.count())
                .couponRedemptions(couponRedemptions)
                .pendingVendorPromotions(vendorPromotionRepository.countByStatus(VendorPromotionRequest.RequestStatus.PENDING))
                .totalFlashSales(flashSaleRepository.count())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAuditResponse);
    }

    // --- Helpers ---
    private List<BannerResponse> filterActiveBanners(List<MarketingBanner> banners, LocalDateTime now) {
        return banners.stream()
                .filter(b -> b.isActive() && isWithinSchedule(b.getStartDate(), b.getEndDate(), now))
                .map(this::toBannerResponse)
                .collect(Collectors.toList());
    }

    private List<AnnouncementResponse> filterActiveAnnouncements(LocalDateTime now) {
        return announcementRepository.findByActiveTrueOrderByPriorityAsc().stream()
                .filter(a -> isWithinSchedule(a.getStartTime(), a.getEndTime(), now))
                .map(this::toAnnouncementResponse)
                .collect(Collectors.toList());
    }

    private List<HomepageSectionResponse> getVisibleSections() {
        return sectionRepository.findAllByOrderBySortOrderAsc().stream()
                .filter(HomepageSection::isVisible)
                .map(this::toSectionResponse)
                .collect(Collectors.toList());
    }

    private List<FlashSaleResponse> getActiveFlashSales(LocalDateTime now) {
        return flashSaleRepository.findByActiveTrueAndEndTimeAfterOrderByStartTimeAsc(now).stream()
                .filter(s -> s.getStartTime().isBefore(now) || s.getStartTime().isEqual(now))
                .map(this::toFlashSaleResponse)
                .collect(Collectors.toList());
    }

    private boolean isWithinSchedule(LocalDateTime start, LocalDateTime end, LocalDateTime now) {
        if (start != null && now.isBefore(start)) return false;
        if (end != null && now.isAfter(end)) return false;
        return true;
    }

    private MarketingBanner mapBanner(MarketingBanner b, BannerRequest r) {
        if (r.getTitle() != null) b.setTitle(r.getTitle());
        b.setSubtitle(r.getSubtitle());
        b.setDescription(r.getDescription());
        b.setImageUrl(r.getImageUrl());
        b.setMobileImageUrl(r.getMobileImageUrl());
        b.setGradient(r.getGradient());
        b.setButtonText(r.getButtonText());
        b.setButtonLink(r.getButtonLink());
        b.setBadge(r.getBadge());
        b.setStartDate(r.getStartDate());
        b.setEndDate(r.getEndDate());
        if (r.getPriority() != null) b.setPriority(r.getPriority());
        if (r.getActive() != null) b.setActive(r.getActive());
        if (r.getDisplayLocation() != null) b.setDisplayLocation(r.getDisplayLocation());
        return b;
    }

    private MarketingCampaign mapCampaign(MarketingCampaign c, CampaignRequest r) {
        if (r.getName() != null) c.setName(r.getName());
        c.setDescription(r.getDescription());
        if (r.getCampaignType() != null) c.setCampaignType(r.getCampaignType());
        if (r.getStatus() != null) c.setStatus(r.getStatus());
        c.setStartDate(r.getStartDate());
        c.setEndDate(r.getEndDate());
        c.setBannerId(r.getBannerId());
        c.setCategoryId(r.getCategoryId());
        c.setVendorId(r.getVendorId());
        return c;
    }

    private FlashSale mapFlashSale(FlashSale sale, FlashSaleRequest r) {
        if (r.getTitle() != null) sale.setTitle(r.getTitle());
        sale.setDescription(r.getDescription());
        if (r.getStartTime() != null) sale.setStartTime(r.getStartTime());
        if (r.getEndTime() != null) sale.setEndTime(r.getEndTime());
        if (r.getActive() != null) sale.setActive(r.getActive());
        if (r.getDiscountPercent() != null) sale.setDiscountPercent(r.getDiscountPercent());
        sale.setStockAllocationLimit(r.getStockAllocationLimit());
        if (r.getItems() != null) {
            for (FlashSaleItemRequest itemReq : r.getItems()) {
                FlashSaleItem item = new FlashSaleItem();
                item.setFlashSale(sale);
                item.setProductId(itemReq.getProductId());
                item.setCategoryId(itemReq.getCategoryId());
                item.setAllocatedStock(itemReq.getAllocatedStock());
                item.setSaleLimit(itemReq.getSaleLimit());
                sale.getItems().add(item);
            }
        }
        return sale;
    }

    private AnnouncementBar mapAnnouncement(AnnouncementBar bar, AnnouncementRequest r) {
        if (r.getText() != null) bar.setText(r.getText());
        bar.setLink(r.getLink());
        if (r.getBackgroundColor() != null) bar.setBackgroundColor(r.getBackgroundColor());
        if (r.getTextColor() != null) bar.setTextColor(r.getTextColor());
        if (r.getPriority() != null) bar.setPriority(r.getPriority());
        if (r.getActive() != null) bar.setActive(r.getActive());
        bar.setStartTime(r.getStartTime());
        bar.setEndTime(r.getEndTime());
        return bar;
    }

    private void audit(String entityType, Long entityId, String action, String details) {
        MarketingAuditLog log = new MarketingAuditLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setDetails(details);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            log.setPerformedByUserId(principal.getUserId());
            log.setPerformedByEmail(principal.getUsername());
        }
        auditLogRepository.save(log);
    }

    private BannerResponse toBannerResponse(MarketingBanner b) {
        return BannerResponse.builder()
                .id(b.getId()).title(b.getTitle()).subtitle(b.getSubtitle()).description(b.getDescription())
                .imageUrl(b.getImageUrl()).mobileImageUrl(b.getMobileImageUrl()).gradient(b.getGradient())
                .buttonText(b.getButtonText()).buttonLink(b.getButtonLink()).badge(b.getBadge())
                .startDate(b.getStartDate()).endDate(b.getEndDate()).priority(b.getPriority())
                .active(b.isActive()).displayLocation(b.getDisplayLocation())
                .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
                .build();
    }

    private CampaignResponse toCampaignResponse(MarketingCampaign c) {
        return CampaignResponse.builder()
                .id(c.getId()).name(c.getName()).description(c.getDescription())
                .campaignType(c.getCampaignType()).status(c.getStatus())
                .startDate(c.getStartDate()).endDate(c.getEndDate())
                .bannerId(c.getBannerId()).categoryId(c.getCategoryId()).vendorId(c.getVendorId())
                .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
                .build();
    }

    private FlashSaleResponse toFlashSaleResponse(FlashSale s) {
        List<FlashSaleItemResponse> items = s.getItems() == null ? List.of() : s.getItems().stream()
                .map(i -> FlashSaleItemResponse.builder()
                        .id(i.getId()).productId(i.getProductId()).categoryId(i.getCategoryId())
                        .allocatedStock(i.getAllocatedStock()).saleLimit(i.getSaleLimit()).build())
                .collect(Collectors.toList());
        return FlashSaleResponse.builder()
                .id(s.getId()).title(s.getTitle()).description(s.getDescription())
                .startTime(s.getStartTime()).endTime(s.getEndTime()).active(s.isActive())
                .discountPercent(s.getDiscountPercent()).stockAllocationLimit(s.getStockAllocationLimit())
                .items(items).createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
                .build();
    }

    private HomepageSectionResponse toSectionResponse(HomepageSection s) {
        return HomepageSectionResponse.builder()
                .id(s.getId()).sectionKey(s.getSectionKey()).sectionType(s.getSectionType())
                .label(s.getLabel()).subtitle(s.getSubtitle()).productIds(s.getProductIds())
                .configJson(s.getConfigJson())
                .visible(s.isVisible()).sortOrder(s.getSortOrder()).displayLimit(s.getDisplayLimit())
                .build();
    }

    private AnnouncementResponse toAnnouncementResponse(AnnouncementBar a) {
        return AnnouncementResponse.builder()
                .id(a.getId()).text(a.getText()).link(a.getLink())
                .backgroundColor(a.getBackgroundColor()).textColor(a.getTextColor())
                .priority(a.getPriority()).active(a.isActive())
                .startTime(a.getStartTime()).endTime(a.getEndTime()).createdAt(a.getCreatedAt())
                .build();
    }

    private MediaAssetResponse toMediaResponse(MediaAsset m) {
        return MediaAssetResponse.builder()
                .id(m.getId()).name(m.getName()).url(m.getUrl())
                .mediaType(m.getMediaType().name()).uploadedByUserId(m.getUploadedByUserId())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private VendorPromotionResponse toVendorPromotionResponse(VendorPromotionRequest r) {
        return VendorPromotionResponse.builder()
                .id(r.getId()).vendorId(r.getVendorId()).title(r.getTitle()).description(r.getDescription())
                .discountPercent(r.getDiscountPercent()).startDate(r.getStartDate()).endDate(r.getEndDate())
                .status(r.getStatus()).adminNotes(r.getAdminNotes()).createdAt(r.getCreatedAt())
                .build();
    }

    private AuditLogResponse toAuditResponse(MarketingAuditLog l) {
        return AuditLogResponse.builder()
                .id(l.getId()).entityType(l.getEntityType()).entityId(l.getEntityId())
                .action(l.getAction()).performedByEmail(l.getPerformedByEmail())
                .details(l.getDetails()).createdAt(l.getCreatedAt())
                .build();
    }
}
