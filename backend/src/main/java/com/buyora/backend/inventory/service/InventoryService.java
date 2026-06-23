package com.buyora.backend.inventory.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.inventory.StockStatus;
import com.buyora.backend.inventory.dto.*;
import com.buyora.backend.inventory.entity.InventoryHistory;
import com.buyora.backend.inventory.entity.StockNotification;
import com.buyora.backend.inventory.entity.StockReservation;
import com.buyora.backend.inventory.repository.InventoryHistoryRepository;
import com.buyora.backend.inventory.repository.StockNotificationRepository;
import com.buyora.backend.inventory.repository.StockReservationRepository;
import com.buyora.backend.order.entity.Order;
import com.buyora.backend.order.entity.OrderItem;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.product.entity.Product;
import com.buyora.backend.product.repository.ProductRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import com.buyora.backend.vendor.entity.Vendor;
import com.buyora.backend.vendor.repository.VendorRepository;
import com.buyora.backend.vendor.service.VendorService;
import com.buyora.backend.wishlist.service.WishlistAlertService;
import com.buyora.backend.notification.entity.NotificationCategory;
import com.buyora.backend.notification.entity.NotificationEventType;
import com.buyora.backend.notification.entity.NotificationPriority;
import com.buyora.backend.notification.service.NotificationDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private static final int[] NOTIFICATION_THRESHOLDS = {10, 5, 0};

    private final ProductRepository productRepository;
    private final StockReservationRepository stockReservationRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final StockNotificationRepository stockNotificationRepository;
    private final OrderRepository orderRepository;
    private final VendorService vendorService;
    private final WishlistAlertService wishlistAlertService;
    private final StockRestockService stockRestockService;
    private final NotificationDispatcher notificationDispatcher;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @Value("${app.inventory.reservation-expiry-minutes:15}")
    private int reservationExpiryMinutes;

    public int getStockQuantity(Product product) {
        return product.getStock() != null ? product.getStock() : 0;
    }

    public int getReservedQuantity(Product product) {
        return product.getReservedQuantity() != null ? product.getReservedQuantity() : 0;
    }

    public int getAvailableQuantity(Product product) {
        return Math.max(0, getStockQuantity(product) - getReservedQuantity(product));
    }

    public int getSoldQuantity(Product product) {
        return product.getSoldQuantity() != null ? product.getSoldQuantity() : 0;
    }

    public int getLowStockThreshold(Product product) {
        return product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 10;
    }

    public StockStatus getStockStatus(Product product) {
        if (product.getStockStatusOverride() != null) {
            return product.getStockStatusOverride();
        }
        return StockStatus.fromAvailable(getAvailableQuantity(product), getLowStockThreshold(product));
    }

    public boolean isPurchasable(Product product) {
        return getStockStatus(product).isPurchasable(getAvailableQuantity(product));
    }

    @Transactional(readOnly = true)
    public void validateAvailableStock(Long productId, int requestedQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        if (!isPurchasable(product)) {
            throw new IllegalArgumentException("Product is not available for purchase");
        }
        if (getStockStatus(product) == StockStatus.PRE_ORDER) {
            return;
        }
        int available = getAvailableQuantity(product);
        if (requestedQuantity > available) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }
    }

    @Transactional
    public void reserveForOrder(Order order) {
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(reservationExpiryMinutes);

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProduct().getId()));

            int available = getAvailableQuantity(product);
            if (getStockStatus(product) != StockStatus.PRE_ORDER && item.getQuantity() > available) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName() + ". Available: " + available);
            }

            int prevStock = getStockQuantity(product);
            int prevReserved = getReservedQuantity(product);
            product.setReservedQuantity(prevReserved + item.getQuantity());
            productRepository.save(product);

            StockReservation reservation = new StockReservation();
            reservation.setOrder(order);
            reservation.setProduct(product);
            reservation.setQuantity(item.getQuantity());
            reservation.setStatus(StockReservation.ReservationStatus.ACTIVE);
            reservation.setExpiresAt(expiresAt);
            stockReservationRepository.save(reservation);

            recordHistory(product, InventoryHistory.ChangeType.RESERVATION_CREATED,
                    prevStock, prevStock, prevReserved, prevReserved + item.getQuantity(),
                    item.getQuantity(), order.getUser().getId(), order.getUser().getFullName(),
                    order.getId(), "Stock reserved for checkout");
        }
    }

    @Transactional
    public void commitReservation(Order order) {
        List<StockReservation> reservations = stockReservationRepository.findByOrderIdAndStatus(
                order.getId(), StockReservation.ReservationStatus.ACTIVE);

        for (StockReservation reservation : reservations) {
            Product product = productRepository.findByIdForUpdate(reservation.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", reservation.getProduct().getId()));

            int qty = reservation.getQuantity();
            int prevStock = getStockQuantity(product);
            int prevReserved = getReservedQuantity(product);

            product.setStock(prevStock - qty);
            product.setReservedQuantity(Math.max(0, prevReserved - qty));
            product.setSoldQuantity(getSoldQuantity(product) + qty);
            productRepository.save(product);

            reservation.setStatus(StockReservation.ReservationStatus.COMMITTED);
            stockReservationRepository.save(reservation);

            recordHistory(product, InventoryHistory.ChangeType.ORDER_PLACED,
                    prevStock, prevStock - qty, prevReserved, prevReserved - qty,
                    qty, order.getUser().getId(), order.getUser().getFullName(),
                    order.getId(), "Stock committed after successful payment");

            checkAndNotifyLowStock(product);
        }
    }

    @Transactional
    public void releaseReservation(Order order) {
        List<StockReservation> reservations = stockReservationRepository.findByOrderIdAndStatus(
                order.getId(), StockReservation.ReservationStatus.ACTIVE);

        for (StockReservation reservation : reservations) {
            Product product = productRepository.findByIdForUpdate(reservation.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", reservation.getProduct().getId()));

            int qty = reservation.getQuantity();
            int prevStock = getStockQuantity(product);
            int prevReserved = getReservedQuantity(product);

            product.setReservedQuantity(Math.max(0, prevReserved - qty));
            productRepository.save(product);

            reservation.setStatus(StockReservation.ReservationStatus.RELEASED);
            stockReservationRepository.save(reservation);

            recordHistory(product, InventoryHistory.ChangeType.RESERVATION_RELEASED,
                    prevStock, prevStock, prevReserved, prevReserved - qty,
                    qty, null, "System", order.getId(), "Reservation released");
        }
    }

    @Transactional
    public void restoreStockOnCancellation(Order order, Long changedByUserId, String changedByName) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProduct().getId()));

            int qty = item.getQuantity();
            int prevStock = getStockQuantity(product);
            int prevReserved = getReservedQuantity(product);
            int prevAvailable = getAvailableQuantity(product);

            product.setStock(prevStock + qty);
            productRepository.save(product);

            recordHistory(product, InventoryHistory.ChangeType.ORDER_CANCELLED,
                    prevStock, prevStock + qty, prevReserved, prevReserved,
                    qty, changedByUserId, changedByName, order.getId(), "Stock restored after order cancellation");

            afterStockIncrease(product, prevAvailable);
        }
    }

    @Transactional
    public void releaseExpiredReservations() {
        List<StockReservation> expired = stockReservationRepository.findByStatusAndExpiresAtBefore(
                StockReservation.ReservationStatus.ACTIVE, LocalDateTime.now());

        for (StockReservation reservation : expired) {
            Order order = reservation.getOrder();
            if (order.getStatus() != Order.OrderStatus.CREATED) {
                continue;
            }
            releaseSingleReservation(reservation, order);
            log.info("Released expired reservation for order {} product {}", order.getId(), reservation.getProduct().getId());
        }
    }

    private void releaseSingleReservation(StockReservation reservation, Order order) {
        Product product = productRepository.findByIdForUpdate(reservation.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", reservation.getProduct().getId()));

        int qty = reservation.getQuantity();
        int prevStock = getStockQuantity(product);
        int prevReserved = getReservedQuantity(product);

        product.setReservedQuantity(Math.max(0, prevReserved - qty));
        productRepository.save(product);

        reservation.setStatus(StockReservation.ReservationStatus.RELEASED);
        stockReservationRepository.save(reservation);

        recordHistory(product, InventoryHistory.ChangeType.RESERVATION_RELEASED,
                prevStock, prevStock, prevReserved, prevReserved - qty,
                qty, null, "System", order.getId(), "Reservation expired after timeout");
    }

    @Transactional
    public VendorInventoryItemResponse increaseStock(Long userId, Long productId, StockAdjustmentRequest request) {
        return adjustStock(userId, productId, request.getQuantity(), true, request.getNotes());
    }

    @Transactional
    public VendorInventoryItemResponse decreaseStock(Long userId, Long productId, StockAdjustmentRequest request) {
        return adjustStock(userId, productId, request.getQuantity(), false, request.getNotes());
    }

    @Transactional
    public VendorInventoryItemResponse setStock(Long userId, Long productId, StockSetRequest request) {
        Product product = getVendorProduct(userId, productId);
        int prevStock = getStockQuantity(product);
        int prevAvailable = getAvailableQuantity(product);
        int newStock = request.getStockQuantity();

        if (newStock < getReservedQuantity(product)) {
            throw new IllegalArgumentException("Stock cannot be less than reserved quantity (" + getReservedQuantity(product) + ")");
        }

        product.setStock(newStock);
        productRepository.save(product);

        User user = userRepository.findById(userId).orElseThrow();
        recordHistory(product, InventoryHistory.ChangeType.MANUAL_ADJUSTMENT,
                prevStock, newStock, getReservedQuantity(product), getReservedQuantity(product),
                Math.abs(newStock - prevStock), userId, user.getFullName(), null,
                request.getNotes() != null ? request.getNotes() : "Manual stock adjustment");

        checkAndNotifyLowStock(product);
        if (newStock > prevStock) {
            afterStockIncrease(product, prevAvailable);
        }
        return toVendorInventoryItem(product);
    }

    private void afterStockIncrease(Product product, int prevAvailable) {
        int currentAvailable = getAvailableQuantity(product);
        wishlistAlertService.checkBackInStock(product, prevAvailable, currentAvailable);
        stockRestockService.notifySubscribers(product, prevAvailable, currentAvailable);
    }

    private VendorInventoryItemResponse adjustStock(Long userId, Long productId, int quantity, boolean increase, String notes) {
        Product product = getVendorProduct(userId, productId);
        int prevStock = getStockQuantity(product);
        int prevAvailable = getAvailableQuantity(product);
        int newStock = increase ? prevStock + quantity : prevStock - quantity;

        if (newStock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        if (newStock < getReservedQuantity(product)) {
            throw new IllegalArgumentException("Stock cannot be less than reserved quantity");
        }

        product.setStock(newStock);
        productRepository.save(product);

        User user = userRepository.findById(userId).orElseThrow();
        recordHistory(product, increase ? InventoryHistory.ChangeType.STOCK_ADDED : InventoryHistory.ChangeType.STOCK_REDUCED,
                prevStock, newStock, getReservedQuantity(product), getReservedQuantity(product),
                quantity, userId, user.getFullName(), null, notes);

        checkAndNotifyLowStock(product);
        if (increase) {
            afterStockIncrease(product, prevAvailable);
        }
        return toVendorInventoryItem(product);
    }

    @Transactional
    public List<VendorInventoryItemResponse> bulkUpdateStock(Long userId, BulkStockUpdateRequest request) {
        List<VendorInventoryItemResponse> results = new ArrayList<>();
        for (BulkStockUpdateRequest.BulkStockItem item : request.getItems()) {
            StockSetRequest setRequest = new StockSetRequest();
            setRequest.setStockQuantity(item.getStockQuantity());
            setRequest.setNotes("Bulk inventory update");
            results.add(setStock(userId, item.getProductId(), setRequest));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<VendorInventoryItemResponse> getVendorInventory(Long userId) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        return productRepository.findByVendorId(vendor.getId(), Pageable.unpaged()).getContent()
                .stream().map(this::toVendorInventoryItem).toList();
    }

    @Transactional
    public List<VendorInventoryItemResponse> uploadStockSheet(Long userId, String csvContent) {
        List<BulkStockUpdateRequest.BulkStockItem> items = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new StringReader(csvContent))) {
            String line;
            boolean headerSkipped = false;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                if (!headerSkipped && line.toLowerCase().contains("product")) {
                    headerSkipped = true;
                    continue;
                }
                String[] parts = line.split(",");
                if (parts.length < 2) continue;
                BulkStockUpdateRequest.BulkStockItem item = new BulkStockUpdateRequest.BulkStockItem();
                String first = parts[0].trim();
                if (first.matches("\\d+")) {
                    item.setProductId(Long.parseLong(first));
                } else {
                    Vendor vendor = vendorService.getVendorEntityByUserId(userId);
                    Product product = productRepository.findByVendorId(vendor.getId(), Pageable.unpaged()).getContent()
                            .stream()
                            .filter(p -> first.equalsIgnoreCase(p.getSku()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("Unknown SKU: " + first));
                    item.setProductId(product.getId());
                }
                item.setStockQuantity(Integer.parseInt(parts[1].trim()));
                items.add(item);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid stock sheet format: " + e.getMessage());
        }
        if (items.isEmpty()) {
            throw new IllegalArgumentException("No valid rows found in stock sheet");
        }
        BulkStockUpdateRequest request = new BulkStockUpdateRequest();
        request.setItems(items);
        return bulkUpdateStock(userId, request);
    }

    @Transactional
    public VendorInventoryItemResponse updateThresholds(Long userId, Long productId, StockThresholdRequest request) {
        Product product = getVendorProduct(userId, productId);
        product.setLowStockThreshold(request.getLowStockThreshold());
        product.setReorderThreshold(request.getReorderThreshold());
        productRepository.save(product);
        checkAndNotifyLowStock(product);
        return toVendorInventoryItem(product);
    }

    @Transactional
    public VendorInventoryItemResponse updateAvailability(Long userId, Long productId, ProductAvailabilityRequest request) {
        Product product = getVendorProduct(userId, productId);
        product.setStockStatusOverride(request.getStockStatusOverride());
        product.setExpectedRestockDate(request.getExpectedRestockDate());
        productRepository.save(product);
        return toVendorInventoryItem(product);
    }

    @Transactional
    public void restoreStockOnReturn(Order order, Long changedByUserId, String changedByName) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProduct().getId()));

            int qty = item.getQuantity();
            int prevStock = getStockQuantity(product);
            int prevAvailable = getAvailableQuantity(product);

            product.setStock(prevStock + qty);
            product.setSoldQuantity(Math.max(0, getSoldQuantity(product) - qty));
            productRepository.save(product);

            recordHistory(product, InventoryHistory.ChangeType.RETURN_RECEIVED,
                    prevStock, prevStock + qty, getReservedQuantity(product), getReservedQuantity(product),
                    qty, changedByUserId, changedByName, order.getId(), "Stock restored after return approval");

            afterStockIncrease(product, prevAvailable);
        }
    }

    @Transactional
    public VendorInventoryItemResponse adminSetStock(Long productId, StockSetRequest request, Long adminUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        int prevStock = getStockQuantity(product);
        int prevAvailable = getAvailableQuantity(product);
        int newStock = request.getStockQuantity();

        if (newStock < getReservedQuantity(product)) {
            throw new IllegalArgumentException("Stock cannot be less than reserved quantity");
        }

        product.setStock(newStock);
        productRepository.save(product);

        User admin = userRepository.findById(adminUserId).orElseThrow();
        recordHistory(product, InventoryHistory.ChangeType.ADMIN_ADJUSTMENT,
                prevStock, newStock, getReservedQuantity(product), getReservedQuantity(product),
                Math.abs(newStock - prevStock), adminUserId, admin.getFullName(), null,
                request.getNotes() != null ? request.getNotes() : "Admin stock adjustment");

        if (newStock > prevStock) {
            afterStockIncrease(product, prevAvailable);
        } else {
            checkAndNotifyLowStock(product);
        }
        return toVendorInventoryItem(product);
    }

    @Transactional(readOnly = true)
    public List<VendorInventoryItemResponse> getVendorInventoryByStatus(Long userId, String status) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        if ("LOW_STOCK".equalsIgnoreCase(status)) {
            return productRepository.findLowStockByVendorId(vendor.getId(), Pageable.unpaged()).getContent()
                    .stream().map(this::toVendorInventoryItem).toList();
        }
        if ("OUT_OF_STOCK".equalsIgnoreCase(status)) {
            return productRepository.findOutOfStockByVendorId(vendor.getId(), Pageable.unpaged()).getContent()
                    .stream().map(this::toVendorInventoryItem).toList();
        }
        return getVendorInventory(userId);
    }

    @Transactional(readOnly = true)
    public VendorInventoryAnalyticsResponse getVendorAnalytics(Long userId) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        Pageable topFive = org.springframework.data.domain.PageRequest.of(0, 5);
        List<TopSellingProductResponse> mostSold = orderRepository.findTopSellingProductsByVendorId(vendor.getId(), topFive);
        List<TopSellingProductResponse> leastSold = orderRepository.findLeastSellingProductsByVendorId(vendor.getId(), topFive);
        return VendorInventoryAnalyticsResponse.builder()
                .mostSoldProducts(mostSold)
                .leastSoldProducts(leastSold)
                .fastMovingProducts(mostSold)
                .slowMovingProducts(leastSold)
                .stockValue(productRepository.sumInventoryValueByVendorId(vendor.getId()))
                .totalInventoryUnits(productRepository.sumStockUnitsByVendorId(vendor.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminInventoryListItemResponse> getAdminInventory(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toAdminInventoryItem);
    }

    @Transactional(readOnly = true)
    public Page<InventoryHistoryResponse> getAdminHistory(Pageable pageable) {
        return inventoryHistoryRepository.findAll(pageable).map(this::toHistoryResponse);
    }

    @Transactional(readOnly = true)
    public VendorInventoryDashboardResponse getVendorDashboard(Long userId) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        long total = productRepository.countByVendorId(vendor.getId());
        long outOfStock = productRepository.countOutOfStockByVendorId(vendor.getId());
        return VendorInventoryDashboardResponse.builder()
                .totalProducts(total)
                .productsInStock(total - outOfStock)
                .lowStockProducts(productRepository.countLowStockByVendorId(vendor.getId()))
                .outOfStockProducts(outOfStock)
                .totalInventoryUnits(productRepository.sumStockUnitsByVendorId(vendor.getId()))
                .inventoryValue(productRepository.sumInventoryValueByVendorId(vendor.getId()))
                .unreadNotifications(stockNotificationRepository.countByVendorIdAndReadFalse(vendor.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public AdminInventoryDashboardResponse getAdminDashboard() {
        List<TopSellingProductResponse> topSelling = orderRepository.findTopSellingProducts(
                org.springframework.data.domain.PageRequest.of(0, 5));
        long total = productRepository.count();
        long outOfStock = productRepository.countOutOfStock();
        List<VendorInventoryHealthResponse> vendorHealth = vendorRepository.findAll().stream()
                .map(v -> VendorInventoryHealthResponse.builder()
                        .vendorId(v.getId())
                        .vendorName(v.getBusinessName())
                        .totalProducts(productRepository.countByVendorId(v.getId()))
                        .lowStockProducts(productRepository.countLowStockByVendorId(v.getId()))
                        .outOfStockProducts(productRepository.countOutOfStockByVendorId(v.getId()))
                        .build())
                .sorted(Comparator.comparingLong(VendorInventoryHealthResponse::getOutOfStockProducts).reversed())
                .limit(10)
                .toList();
        return AdminInventoryDashboardResponse.builder()
                .totalProducts(total)
                .productsInStock(total - outOfStock)
                .lowStockProducts(productRepository.countLowStock())
                .outOfStockProducts(outOfStock)
                .totalInventoryUnits(productRepository.sumTotalStockUnits())
                .totalInventoryValue(productRepository.sumTotalInventoryValue())
                .topSellingProducts(topSelling)
                .vendorHealth(vendorHealth)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<InventoryHistoryResponse> getProductHistory(Long productId, Pageable pageable) {
        Page<InventoryHistory> page = inventoryHistoryRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return page.map(this::toHistoryResponse);
    }

    @Transactional(readOnly = true)
    public Page<InventoryHistoryResponse> getVendorHistory(Long userId, Pageable pageable) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        Page<InventoryHistory> page = inventoryHistoryRepository.findByProduct_VendorIdOrderByCreatedAtDesc(vendor.getId(), pageable);
        return page.map(this::toHistoryResponse);
    }

    @Transactional(readOnly = true)
    public Page<StockNotificationResponse> getVendorNotifications(Long userId, Pageable pageable) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        return stockNotificationRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId(), pageable)
                .map(this::toNotificationResponse);
    }

    @Transactional
    public void markNotificationRead(Long userId, Long notificationId) {
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        StockNotification notification = stockNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getVendor().getId().equals(vendor.getId())) {
            throw new IllegalArgumentException("Not your notification");
        }
        notification.setRead(true);
        stockNotificationRepository.save(notification);
    }

    private Product getVendorProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        Vendor vendor = vendorService.getVendorEntityByUserId(userId);
        if (!product.getVendor().getId().equals(vendor.getId())) {
            throw new IllegalArgumentException("Not your product");
        }
        return product;
    }

    private void checkAndNotifyLowStock(Product product) {
        int available = getAvailableQuantity(product);
        Vendor vendor = product.getVendor();
        int productThreshold = getLowStockThreshold(product);

        if (available > 0 && available <= productThreshold) {
            notifyVendorStockAlert(vendor, product, available, productThreshold, NotificationEventType.LOW_STOCK);
        } else if (available <= 0) {
            notifyVendorStockAlert(vendor, product, available, 0, NotificationEventType.OUT_OF_STOCK);
        }

        for (int threshold : NOTIFICATION_THRESHOLDS) {
            if (available <= threshold) {
                if (!stockNotificationRepository.existsByProductIdAndThresholdAndReadFalse(product.getId(), threshold)) {
                    StockNotification notification = new StockNotification();
                    notification.setVendor(vendor);
                    notification.setProduct(product);
                    notification.setThreshold(threshold);
                    notification.setAvailableQuantity(available);
                    notification.setMessage(buildNotificationMessage(product.getName(), available, threshold));
                    notification.setRead(false);
                    stockNotificationRepository.save(notification);
                    log.info("Low stock notification created for product {} at threshold {}", product.getId(), threshold);
                }
            }
        }
    }

    private void notifyVendorStockAlert(Vendor vendor, Product product, int available, int threshold,
                                        NotificationEventType eventType) {
        if (vendor.getUser() == null) return;
        String title = eventType == NotificationEventType.OUT_OF_STOCK ? "Out of Stock" : "Low Stock Alert";
        String message = buildNotificationMessage(product.getName(), available, threshold);
        notificationDispatcher.send(
                vendor.getUser().getId(),
                title,
                message,
                NotificationCategory.SYSTEM,
                eventType,
                NotificationPriority.HIGH,
                "/dashboard/inventory");
    }

    private String buildNotificationMessage(String productName, int available, int threshold) {
        if (threshold == 0) {
            return productName + " is out of stock.";
        }
        return productName + " has only " + available + " units left (threshold: " + threshold + ").";
    }

    private void recordHistory(Product product, InventoryHistory.ChangeType changeType,
                               int prevStock, int newStock, int prevReserved, int newReserved,
                               int quantityChanged, Long userId, String userName,
                               Long orderId, String notes) {
        InventoryHistory history = new InventoryHistory();
        history.setProduct(product);
        history.setChangeType(changeType);
        history.setPreviousStock(prevStock);
        history.setNewStock(newStock);
        history.setPreviousReserved(prevReserved);
        history.setNewReserved(newReserved);
        history.setQuantityChanged(quantityChanged);
        history.setChangedByUserId(userId);
        history.setChangedByName(userName);
        history.setOrderId(orderId);
        history.setNotes(notes);
        inventoryHistoryRepository.save(history);
    }

    private VendorInventoryItemResponse toVendorInventoryItem(Product product) {
        String imageUrl = product.getImageUrls() != null && !product.getImageUrls().isEmpty()
                ? product.getImageUrls().get(0) : null;
        return VendorInventoryItemResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .stockQuantity(getStockQuantity(product))
                .reservedQuantity(getReservedQuantity(product))
                .availableQuantity(getAvailableQuantity(product))
                .soldQuantity(getSoldQuantity(product))
                .lowStockThreshold(getLowStockThreshold(product))
                .reorderThreshold(product.getReorderThreshold())
                .stockStatus(getStockStatus(product).name())
                .price(product.getPrice())
                .imageUrl(imageUrl)
                .lastUpdated(product.getUpdatedAt())
                .build();
    }

    private AdminInventoryListItemResponse toAdminInventoryItem(Product product) {
        String imageUrl = product.getImageUrls() != null && !product.getImageUrls().isEmpty()
                ? product.getImageUrls().get(0) : null;
        return AdminInventoryListItemResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .vendorId(product.getVendor().getId())
                .vendorName(product.getVendor().getBusinessName())
                .stockQuantity(getStockQuantity(product))
                .reservedQuantity(getReservedQuantity(product))
                .availableQuantity(getAvailableQuantity(product))
                .soldQuantity(getSoldQuantity(product))
                .stockStatus(getStockStatus(product).name())
                .price(product.getPrice())
                .imageUrl(imageUrl)
                .build();
    }

    private InventoryHistoryResponse toHistoryResponse(InventoryHistory h) {
        return InventoryHistoryResponse.builder()
                .id(h.getId())
                .productId(h.getProduct().getId())
                .productName(h.getProduct().getName())
                .changeType(h.getChangeType())
                .previousStock(h.getPreviousStock())
                .newStock(h.getNewStock())
                .previousReserved(h.getPreviousReserved())
                .newReserved(h.getNewReserved())
                .quantityChanged(h.getQuantityChanged())
                .changedByUserId(h.getChangedByUserId())
                .changedByName(h.getChangedByName())
                .orderId(h.getOrderId())
                .notes(h.getNotes())
                .createdAt(h.getCreatedAt())
                .build();
    }

    private StockNotificationResponse toNotificationResponse(StockNotification n) {
        return StockNotificationResponse.builder()
                .id(n.getId())
                .productId(n.getProduct().getId())
                .productName(n.getProduct().getName())
                .threshold(n.getThreshold())
                .availableQuantity(n.getAvailableQuantity())
                .message(n.getMessage())
                .read(n.getRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
