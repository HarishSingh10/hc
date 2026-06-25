package com.food.ordering.controller;

import com.food.ordering.dto.OrderRequest;
import com.food.ordering.dto.PaymentVerifyRequest;
import com.food.ordering.entity.*;
import com.food.ordering.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@Transactional
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.mock}")
    private boolean razorpayMock;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userRepository.findByEmail(principal.getName()).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Cart is empty!");
        }

        double totalPrice = 0.0;
        for (CartItem item : cartItems) {
            totalPrice += item.getMenuItem().getPrice() * item.getQuantity();
        }

        Order order = Order.builder()
                .user(user)
                .totalPrice(totalPrice)
                .status("Pending Payment")
                .address(request.getAddress())
                .createdAt(LocalDateTime.now())
                .paymentStatus("Pending")
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(item.getMenuItem())
                    .quantity(item.getQuantity())
                    .price(item.getMenuItem().getPrice())
                    .build();
            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getId());
        response.put("amount", totalPrice);
        response.put("currency", "INR");

        if (razorpayMock) {
            response.put("razorpayOrderId", "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
            response.put("keyId", "rzp_test_mockkeyid123");
            response.put("mock", true);
        } else {
            try {
                RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", (int) (totalPrice * 100));
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "order_rcpt_" + savedOrder.getId());

                com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                
                response.put("razorpayOrderId", razorpayOrder.get("id"));
                response.put("keyId", razorpayKeyId);
                response.put("mock", false);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error creating Razorpay Order: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<Order> orderOpt = orderRepository.findById(request.getOrderId());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Order not found");
        }

        Order order = orderOpt.get();

        if (razorpayMock) {
            order.setStatus("Placed");
            order.setPaymentStatus("Completed");
            order.setPaymentId(request.getPaymentId() != null ? request.getPaymentId() : "pay_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14));
            orderRepository.save(order);

            cartItemRepository.deleteByUserId(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment simulated and verified successfully");
            response.put("orderId", order.getId());
            return ResponseEntity.ok(response);
        } else {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getPaymentId());
                options.put("razorpay_signature", request.getSignature());

                boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

                if (isValid) {
                    order.setStatus("Placed");
                    order.setPaymentStatus("Completed");
                    order.setPaymentId(request.getPaymentId());
                    orderRepository.save(order);

                    cartItemRepository.deleteByUserId(user.getId());

                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Payment verified successfully");
                    response.put("orderId", order.getId());
                    return ResponseEntity.ok(response);
                } else {
                    order.setPaymentStatus("Failed");
                    orderRepository.save(order);
                    return ResponseEntity.badRequest().body("Error: Invalid payment signature verification failed.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error verifying signature: " + e.getMessage());
            }
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Order not found");
        }

        Order order = orderOpt.get();
        if (user.getRole() != Role.ADMIN && !order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }

        return ResponseEntity.ok(order);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getRestaurantOrders(@PathVariable Long restaurantId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        if (user.getRole() == Role.SHOP_OWNER) {
            if (user.getRestaurant() == null || !user.getRestaurant().getId().equals(restaurantId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied - You do not own this restaurant");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }

        List<Order> orders = orderRepository.findByRestaurantId(restaurantId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Order not found");
        }

        Order order = orderOpt.get();

        if (user.getRole() == Role.SHOP_OWNER) {
            if (user.getRestaurant() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied - You do not own a restaurant");
            }
            boolean ownsItem = order.getOrderItems().stream()
                    .anyMatch(oi -> oi.getMenuItem().getRestaurant().getId().equals(user.getRestaurant().getId()));
            if (!ownsItem) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied - This order has no items from your restaurant");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }

        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Status cannot be empty");
        }

        order.setStatus(status.trim());
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Order not found");
        }

        Order order = orderOpt.get();

        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }

        if (!"Placed".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.badRequest().body("Error: Order cannot be cancelled now. It is already: " + order.getStatus());
        }

        order.setStatus("Cancelled");
        order.setPaymentStatus("Refunded");
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
}
