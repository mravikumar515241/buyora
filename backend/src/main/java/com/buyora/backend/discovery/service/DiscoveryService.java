package com.buyora.backend.discovery.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.discovery.dto.*;
import com.buyora.backend.discovery.entity.ProductView;
import com.buyora.backend.discovery.entity.SearchEvent;
import com.buyora.backend.discovery.entity.SearchHistory;
import com.buyora.backend.discovery.repository.ProductViewRepository;
import com.buyora.backend.discovery.repository.SearchEventRepository;
import com.buyora.backend.discovery.repository.SearchHistoryRepository;
import com.buyora.backend.product.dto.ProductResponse;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.product.service.ProductService;
import com.buyora.backend.review.repository.ReviewRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.repository.VendorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final EntityManager entityManager;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final ProductViewRepository productViewRepository;
    private final SearchEventRepository searchEventRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice,
                                        Double minRating, Long vendorId, String stockStatus, String sort,
                                        Pageable pageable) {
        SearchQueryBuilder builder = new SearchQueryBuilder(q, categoryIds, minPrice, maxPrice, minRating, vendorId, stockStatus, sort);
        long total = countSearch(builder);
        if (total == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        List<Long> ids = fetchSearchIds(builder, pageable);
        Map<Long, ProductResponse> byId = productRepository.findAllById(ids).stream()
                .map(productService::toPublicResponse)
                .collect(Collectors.toMap(ProductResponse::getId, p -> p, (a, b) -> a, LinkedHashMap::new));
        List<ProductResponse> content = ids.stream().map(byId::get).filter(Objects::nonNull).toList();
        return new PageImpl<>(content, pageable, total);
    }

    @Transactional
    public void recordSearch(String keyword, Long userId, int resultCount) {
        if (keyword == null || keyword.isBlank()) return;
        SearchEvent event = new SearchEvent();
        event.setKeyword(keyword.trim().toLowerCase());
        event.setResultCount(resultCount);
        event.setConverted(resultCount > 0);
        if (userId != null) {
            userRepository.findById(userId).ifPresent(event::setUser);
        }
        searchEventRepository.save(event);
    }

    @Transactional
    public void saveSearchHistory(Long userId, String keyword) {
        if (userId == null || keyword == null || keyword.isBlank()) return;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String normalized = keyword.trim();
        SearchHistory history = searchHistoryRepository.findByUserIdAndKeywordIgnoreCase(userId, normalized)
                .orElseGet(() -> {
                    SearchHistory h = new SearchHistory();
                    h.setUser(user);
                    h.setKeyword(normalized);
                    return h;
                });
        history.setKeyword(normalized);
        searchHistoryRepository.save(history);
        trimSearchHistory(userId);
    }

    @Transactional(readOnly = true)
    public List<String> getSearchHistory(Long userId) {
        if (userId == null) return List.of();
        return searchHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .limit(10)
                .map(SearchHistory::getKeyword)
                .toList();
    }

    @Transactional
    public void clearSearchHistory(Long userId) {
        if (userId != null) {
            searchHistoryRepository.deleteByUserId(userId);
        }
    }

    @Transactional(readOnly = true)
    public SearchSuggestionResponse getSuggestions(String q) {
        if (q == null || q.isBlank()) {
            return SearchSuggestionResponse.builder()
                    .suggestions(getTrendingKeywords(8))
                    .products(List.of())
                    .build();
        }
        String term = q.trim().toLowerCase();
        Page<ProductResponse> products = search(q, List.of(), null, null, null, null, null, "newest",
                PageRequest.of(0, 5));

        @SuppressWarnings("unchecked")
        List<String> nameSuggestions = entityManager.createNativeQuery("""
                SELECT DISTINCT LOWER(p.name) FROM products p
                WHERE p.status = 'APPROVED' AND LOWER(p.name) LIKE :term
                ORDER BY LOWER(p.name) LIMIT 5
                """)
                .setParameter("term", term + "%")
                .getResultList();

        @SuppressWarnings("unchecked")
        List<String> tagSuggestions = entityManager.createNativeQuery("""
                SELECT DISTINCT LOWER(pt.tag) FROM product_tags pt
                JOIN products p ON p.id = pt.product_id
                WHERE p.status = 'APPROVED' AND LOWER(pt.tag) LIKE :term
                ORDER BY LOWER(pt.tag) LIMIT 5
                """)
                .setParameter("term", term + "%")
                .getResultList();

        LinkedHashSet<String> suggestions = new LinkedHashSet<>();
        suggestions.addAll(nameSuggestions);
        suggestions.addAll(tagSuggestions);

        return SearchSuggestionResponse.builder()
                .suggestions(suggestions.stream().limit(8).toList())
                .products(products.getContent())
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getTrendingKeywords(int limit) {
        return searchEventRepository.findTrendingKeywords(PageRequest.of(0, limit)).stream()
                .map(row -> (String) row[0])
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getPopularProducts(int limit) {
        List<Object[]> rows = productViewRepository.findMostViewedProductIds(PageRequest.of(0, limit));
        if (rows.isEmpty()) {
            return productRepository.findAllApproved(PageRequest.of(0, limit)).getContent().stream()
                    .map(productService::toPublicResponse)
                    .toList();
        }
        List<Long> ids = rows.stream().map(r -> (Long) r[0]).toList();
        Map<Long, ProductResponse> map = productRepository.findAllById(ids).stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .map(productService::toPublicResponse)
                .collect(Collectors.toMap(ProductResponse::getId, p -> p));
        return ids.stream().map(map::get).filter(Objects::nonNull).toList();
    }

    @Transactional
    public void recordProductView(Long productId, Long userId, String sessionId) {
        Product product = productRepository.findById(productId)
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        ProductView view = new ProductView();
        view.setProduct(product);
        if (userId != null) {
            userRepository.findById(userId).ifPresent(view::setUser);
        }
        if (sessionId != null && !sessionId.isBlank()) {
            view.setSessionId(sessionId.trim());
        }
        productViewRepository.save(view);
        trimRecentViews(userId, sessionId);
    }

    private void trimRecentViews(Long userId, String sessionId) {
        List<ProductView> views;
        if (userId != null) {
            views = productViewRepository.findRecentByUserId(userId, PageRequest.of(0, 200));
        } else if (sessionId != null && !sessionId.isBlank()) {
            views = productViewRepository.findRecentBySessionId(sessionId.trim(), PageRequest.of(0, 200));
        } else {
            return;
        }
        if (views.size() <= 120) return;
        List<Long> deleteIds = views.subList(120, views.size()).stream().map(ProductView::getId).toList();
        productViewRepository.deleteAllById(deleteIds);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRecentlyViewed(Long userId, String sessionId, int limit) {
        int cappedLimit = Math.min(Math.max(limit, 1), 50);
        List<ProductView> views;
        if (userId != null) {
            views = productViewRepository.findRecentByUserId(userId, PageRequest.of(0, cappedLimit * 2));
        } else if (sessionId != null && !sessionId.isBlank()) {
            views = productViewRepository.findRecentBySessionId(sessionId.trim(), PageRequest.of(0, cappedLimit * 2));
        } else {
            return List.of();
        }

        LinkedHashSet<Long> seen = new LinkedHashSet<>();
        List<Long> ids = new ArrayList<>();
        for (ProductView v : views) {
            Long id = v.getProduct().getId();
            if (seen.add(id)) ids.add(id);
            if (ids.size() >= cappedLimit) break;
        }
        Map<Long, ProductResponse> map = productRepository.findAllById(ids).stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .map(productService::toPublicResponse)
                .collect(Collectors.toMap(ProductResponse::getId, p -> p));
        return ids.stream().map(map::get).filter(Objects::nonNull).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getSimilarProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .filter(p -> p.getStatus() == Product.ProductStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        BigDecimal price = product.getPrice();
        BigDecimal minPrice = price.multiply(BigDecimal.valueOf(0.7));
        BigDecimal maxPrice = price.multiply(BigDecimal.valueOf(1.3));
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;

        List<Long> categoryIds = categoryId != null ? List.of(categoryId) : List.of();
        Page<ProductResponse> page = search(null, categoryIds, minPrice, maxPrice, null, null, "IN_STOCK",
                "rating", PageRequest.of(0, limit + 5));

        return page.getContent().stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorFilterOption> getVendorFilterOptions() {
        return vendorRepository.findAll().stream()
                .filter(Vendor::isApproved)
                .map(v -> VendorFilterOption.builder()
                        .id(v.getId())
                        .businessName(v.getBusinessName())
                        .averageRating(reviewRepository.getAverageRatingByVendorId(v.getId()))
                        .productCount(productRepository.countByVendorId(v.getId()))
                        .build())
                .filter(v -> v.getProductCount() > 0)
                .sorted(Comparator.comparing(VendorFilterOption::getBusinessName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public DiscoveryAnalyticsResponse getAnalytics() {
        return DiscoveryAnalyticsResponse.builder()
                .mostSearchedKeywords(mapKeywords(searchEventRepository.findMostSearchedKeywords(PageRequest.of(0, 10))))
                .searchesWithNoResults(mapKeywords(searchEventRepository.findNoResultKeywords(PageRequest.of(0, 10))))
                .topConvertingSearches(mapKeywords(searchEventRepository.findTopConvertingKeywords(PageRequest.of(0, 10))))
                .mostViewedProducts(mapViewed(productViewRepository.findMostViewedProductIds(PageRequest.of(0, 10))))
                .build();
    }

    private List<KeywordCountItem> mapKeywords(List<Object[]> rows) {
        return rows.stream().map(r -> KeywordCountItem.builder()
                .keyword((String) r[0])
                .count(((Number) r[1]).longValue())
                .build()).toList();
    }

    private List<ViewedProductItem> mapViewed(List<Object[]> rows) {
        return rows.stream().map(r -> {
            Long productId = (Long) r[0];
            String name = productRepository.findById(productId).map(Product::getName).orElse("Product");
            return ViewedProductItem.builder()
                    .productId(productId)
                    .productName(name)
                    .viewCount(((Number) r[1]).longValue())
                    .build();
        }).toList();
    }

    private void trimSearchHistory(Long userId) {
        List<SearchHistory> all = searchHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (all.size() <= 10) return;
        searchHistoryRepository.deleteAll(all.subList(10, all.size()));
    }

    private long countSearch(SearchQueryBuilder builder) {
        Query query = entityManager.createNativeQuery("SELECT COUNT(DISTINCT p.id) " + builder.fromWhere());
        builder.bindParams(query);
        return ((Number) query.getSingleResult()).longValue();
    }

    @SuppressWarnings("unchecked")
    private List<Long> fetchSearchIds(SearchQueryBuilder builder, Pageable pageable) {
        Query query = entityManager.createNativeQuery(
                "SELECT p.id " + builder.fromWhere() + builder.orderBy() + " LIMIT :limit OFFSET :offset");
        builder.bindParams(query);
        query.setParameter("limit", pageable.getPageSize());
        query.setParameter("offset", pageable.getOffset());
        return ((List<Number>) query.getResultList()).stream().map(Number::longValue).toList();
    }

    private static class SearchQueryBuilder {
        private final String q;
        private final List<Long> categoryIds;
        private final BigDecimal minPrice;
        private final BigDecimal maxPrice;
        private final Double minRating;
        private final Long vendorId;
        private final String stockStatus;
        private final String sort;

        SearchQueryBuilder(String q, List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice,
                           Double minRating, Long vendorId, String stockStatus, String sort) {
            this.q = q != null && !q.isBlank() ? q.trim() : null;
            this.categoryIds = categoryIds != null ? categoryIds : List.of();
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.minRating = minRating;
            this.vendorId = vendorId;
            this.stockStatus = stockStatus != null && !stockStatus.isBlank() ? stockStatus.toUpperCase() : null;
            this.sort = sort != null && !sort.isBlank() ? sort.toLowerCase() : "newest";
        }

        String fromWhere() {
            StringBuilder sql = new StringBuilder("""
                    FROM products p
                    JOIN vendors v ON v.id = p.vendor_id
                    LEFT JOIN categories c ON c.id = p.category_id
                    WHERE p.status = 'APPROVED'
                    """);
            if (q != null) {
                sql.append("""
                         AND (
                           LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(v.business_name) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR EXISTS (
                             SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id
                             AND LOWER(pt.tag) LIKE LOWER(CONCAT('%', :q, '%'))
                           )
                         )
                        """);
            }
            if (!categoryIds.isEmpty()) {
                sql.append(" AND p.category_id IN (:categoryIds) ");
            }
            if (minPrice != null) {
                sql.append(" AND p.price >= :minPrice ");
            }
            if (maxPrice != null) {
                sql.append(" AND p.price <= :maxPrice ");
            }
            if (vendorId != null) {
                sql.append(" AND p.vendor_id = :vendorId ");
            }
            if (minRating != null) {
                sql.append("""
                         AND COALESCE((
                           SELECT AVG(r.rating) FROM reviews r
                           WHERE r.product_id = p.id AND r.moderation_status = 'VISIBLE'
                         ), 0) >= :minRating
                        """);
            }
            if (stockStatus != null) {
                sql.append(" AND ").append(stockCondition());
            }
            return sql.toString();
        }

        private String stockCondition() {
            String available = "(COALESCE(p.stock, 0) - COALESCE(p.reserved_quantity, 0))";
            return switch (stockStatus) {
                case "IN_STOCK" -> available + " > 10";
                case "LOW_STOCK" -> available + " BETWEEN 1 AND 10";
                case "OUT_OF_STOCK" -> available + " <= 0";
                default -> "1=1";
            };
        }

        String orderBy() {
            return switch (sort) {
                case "oldest" -> " ORDER BY p.created_at ASC ";
                case "price_asc" -> " ORDER BY p.price ASC ";
                case "price_desc" -> " ORDER BY p.price DESC ";
                case "rating" -> """
                         ORDER BY COALESCE((
                           SELECT AVG(r.rating) FROM reviews r
                           WHERE r.product_id = p.id AND r.moderation_status = 'VISIBLE'
                         ), 0) DESC, p.created_at DESC
                        """;
                case "best_selling" -> """
                         ORDER BY COALESCE((
                           SELECT SUM(oi.quantity) FROM order_items oi
                           JOIN orders o ON o.id = oi.order_id
                           WHERE oi.product_id = p.id AND o.status IN ('PAID','SHIPPED','DELIVERED')
                         ), 0) DESC
                        """;
                case "most_reviewed" -> """
                         ORDER BY COALESCE((
                           SELECT COUNT(r.id) FROM reviews r
                           WHERE r.product_id = p.id AND r.moderation_status = 'VISIBLE'
                         ), 0) DESC
                        """;
                case "most_wishlisted" -> """
                         ORDER BY COALESCE((
                           SELECT COUNT(w.id) FROM wishlist_items w WHERE w.product_id = p.id
                         ), 0) DESC
                        """;
                default -> " ORDER BY p.created_at DESC ";
            };
        }

        void bindParams(Query query) {
            if (q != null) query.setParameter("q", q);
            if (!categoryIds.isEmpty()) query.setParameter("categoryIds", categoryIds);
            if (minPrice != null) query.setParameter("minPrice", minPrice);
            if (maxPrice != null) query.setParameter("maxPrice", maxPrice);
            if (vendorId != null) query.setParameter("vendorId", vendorId);
            if (minRating != null) query.setParameter("minRating", minRating);
        }
    }
}
