package com.buyora.backend.payment.service;

import com.buyora.backend.common.exception.ResourceNotFoundException;
import com.buyora.backend.order.entity.Order;
import com.buyora.backend.order.repository.OrderRepository;
import com.buyora.backend.inventory.service.InventoryService;
import com.buyora.backend.notification.service.NotificationDispatcher;
import com.buyora.backend.payment.dto.CreatePaymentResponse;
import com.buyora.backend.payment.entity.Payment;
import com.buyora.backend.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryService inventoryService;
    private final NotificationDispatcher notificationDispatcher;
    private final RestTemplate restTemplate;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    private static final String RAZORPAY_URL = "https://api.razorpay.com/v1";

    @Transactional
    public CreatePaymentResponse createOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your order");
        }
        if (order.getStatus() != Order.OrderStatus.CREATED) {
            throw new IllegalArgumentException("Order already paid or processed");
        }
        
        // Mock mode: Use dummy credentials if real credentials not configured
        boolean useMockMode = keyId == null || keyId.isEmpty() || keySecret == null || keySecret.isEmpty();
        
        if (useMockMode) {
            // Mock Razorpay for development
            return createMockOrder(order, orderId);
        }
        
        // Real Razorpay integration
        long amountPaise = order.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();
        String body = "{\"amount\":" + amountPaise + ",\"currency\":\"INR\",\"receipt\":\"order_" + orderId + "\"}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String auth = Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + auth);
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.exchange(RAZORPAY_URL + "/orders", HttpMethod.POST, entity, Map.class);
        Map<String, Object> resBody = res.getBody();
        if (resBody == null || !resBody.containsKey("id")) {
            throw new RuntimeException("Razorpay order creation failed");
        }
        String razorpayOrderId = (String) resBody.get("id");
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);
        return CreatePaymentResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .amount(String.valueOf(amountPaise))
                .currency("INR")
                .keyId(keyId)
                .build();
    }
    
    /**
     * Mock Razorpay order creation for development/testing
     */
    private CreatePaymentResponse createMockOrder(Order order, Long orderId) {
        long amountPaise = order.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();
        String mockRazorpayOrderId = "order_mock_" + orderId + "_" + System.currentTimeMillis();
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRazorpayOrderId(mockRazorpayOrderId);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);
        
        return CreatePaymentResponse.builder()
                .razorpayOrderId(mockRazorpayOrderId)
                .amount(String.valueOf(amountPaise))
                .currency("INR")
                .keyId("mock_key_id")
                .build();
    }

    @Transactional
    public void verifyAndCapture(Long userId, String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySignature, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your order");
        }
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        if (!payment.getRazorpayOrderId().equals(razorpayOrderId)) {
            throw new IllegalArgumentException("Order ID mismatch");
        }
        
        // Mock mode: Auto-approve if using mock order ID
        boolean isMockPayment = razorpayOrderId.startsWith("order_mock_");
        
        if (isMockPayment) {
            // Mock payment verification - auto-approve
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(Payment.PaymentStatus.CAPTURED);
            paymentRepository.save(payment);
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);
            inventoryService.commitReservation(order);
            notificationDispatcher.paymentSuccessful(userId, orderId, "ORD" + orderId);
            return;
        }
        
        // Real Razorpay signature verification
        String expectedSig = hmacSha256(razorpayOrderId + "|" + razorpayPaymentId, keySecret);
        if (!expectedSig.equals(razorpaySignature)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            notificationDispatcher.paymentFailed(userId, orderId, "ORD" + orderId);
            throw new IllegalArgumentException("Invalid payment signature");
        }
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(Payment.PaymentStatus.CAPTURED);
        paymentRepository.save(payment);
        order.setStatus(Order.OrderStatus.PAID);
        orderRepository.save(order);
        inventoryService.commitReservation(order);
        notificationDispatcher.paymentSuccessful(userId, orderId, "ORD" + orderId);
    }

    private static String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Signature failed", e);
        }
    }
}
