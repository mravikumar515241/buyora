package com.buyora.backend.order.service;

import com.buyora.backend.cart.service.CartService;
import com.buyora.backend.cart.repository.CartItemRepository;
import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.coupon.entity.Coupon;
import com.buyora.backend.coupon.repository.CouponRepository;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.order.dto.OrderItemResponse;
import com.buyora.backend.order.dto.OrderResponse;
import com.buyora.backend.order.entity.Order;
import com.buyora.backend.order.entity.OrderItem;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.user.entity.User;
import com.buyora.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;
    private final CouponRepository couponRepository;
    private final InventoryService inventoryService;
    private final NotificationDispatcher notificationDispatcher;

    @Transactional
    public OrderResponse checkout(Long userId, com.buyora.backend.order.dto.CheckoutRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        List<com.buyora.backend.cart.entity.CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }
        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.CREATED);
        order.setShippingAddress(request.getShippingAddress());
        order.setPhone(request.getPhone());
        
        // Calculate subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        for (com.buyora.backend.cart.entity.CartItem ci : cartItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());
            oi.setPriceAtOrder(ci.getProduct().getPrice());
            subtotal = subtotal.add(oi.getPriceAtOrder().multiply(BigDecimal.valueOf(oi.getQuantity())));
            order.getItems().add(oi);
        }
        
        order.setSubtotal(subtotal);
        
        // Apply coupon if provided
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String couponCode = request.getCouponCode().trim().toUpperCase();
            Coupon coupon = couponRepository.findByCode(couponCode).orElse(null);
            
            if (coupon != null && validateCoupon(coupon, subtotal)) {
                discount = calculateDiscount(coupon, subtotal);
                order.setCouponCode(couponCode);
                order.setDiscountAmount(discount);
                
                // Increment usage count
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            }
        }
        
        // Calculate final total
        BigDecimal total = subtotal.subtract(discount);
        order.setTotalAmount(total);
        
        order = orderRepository.save(order);
        inventoryService.reserveForOrder(order);
        cartService.clearCart(userId);
        notificationDispatcher.orderCreated(userId, order.getId(), "ORD" + order.getId());
        return toResponse(order);
    }
    
    private boolean validateCoupon(Coupon coupon, BigDecimal orderAmount) {
        if (!coupon.isActive()) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        // Use date-only comparison for more lenient validation
        if (now.toLocalDate().isBefore(coupon.getValidFrom().toLocalDate()) || 
            now.toLocalDate().isAfter(coupon.getValidTo().toLocalDate())) {
            return false;
        }
        
        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return false;
        }
        
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return false;
        }
        
        return true;
    }
    
    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;

        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = orderAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null && 
                discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();

            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your order");
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        order = orderRepository.save(order);

        if (status == Order.OrderStatus.CANCELLED && previousStatus != Order.OrderStatus.CANCELLED) {
            if (previousStatus == Order.OrderStatus.CREATED) {
                inventoryService.releaseReservation(order);
            } else if (previousStatus == Order.OrderStatus.PAID
                    || previousStatus == Order.OrderStatus.SHIPPED) {
                inventoryService.restoreStockOnCancellation(order, null, "Admin");
            }
        }

        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, Order.OrderStatus status, Long changedByUserId, String changedByName) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(status);
        order = orderRepository.save(order);

        if (status == Order.OrderStatus.CANCELLED && previousStatus != Order.OrderStatus.CANCELLED) {
            if (previousStatus == Order.OrderStatus.CREATED) {
                inventoryService.releaseReservation(order);
            } else if (previousStatus == Order.OrderStatus.PAID
                    || previousStatus == Order.OrderStatus.SHIPPED) {
                inventoryService.restoreStockOnCancellation(order, changedByUserId, changedByName);
            }
        }

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrdersForAdmin(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponseForAdmin);
    }

    private OrderResponse toResponseForAdmin(Order order) {
        OrderResponse r = toResponse(order);
        r.setUserId(order.getUser().getId());
        r.setUserEmail(order.getUser().getEmail());
        return r;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        for (OrderItem oi : order.getItems()) {
            BigDecimal subtotal = oi.getPriceAtOrder().multiply(BigDecimal.valueOf(oi.getQuantity()));
            
            String imageUrl = null;
            if (oi.getProduct().getImageUrls() != null && !oi.getProduct().getImageUrls().isEmpty()) {
                imageUrl = oi.getProduct().getImageUrls().get(0);
            }
            
            itemResponses.add(OrderItemResponse.builder()
                    .productId(oi.getProduct().getId())
                    .productName(oi.getProduct().getName())
                    .imageUrl(imageUrl)
                    .quantity(oi.getQuantity())
                    .priceAtOrder(oi.getPriceAtOrder())
                    .subtotal(subtotal)
                    .build());
        }
        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
