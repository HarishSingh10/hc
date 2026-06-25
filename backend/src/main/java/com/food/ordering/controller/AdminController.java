package com.food.ordering.controller;

import com.food.ordering.dto.DashboardResponse;
import com.food.ordering.dto.PopularItemDto;
import com.food.ordering.entity.MenuItem;
import com.food.ordering.entity.Order;
import com.food.ordering.entity.OrderItem;
import com.food.ordering.entity.User;
import com.food.ordering.repository.OrderRepository;
import com.food.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null || user.getRole() != com.food.ordering.entity.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access denied");
        }

        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        long totalOrders = allOrders.size();

        double totalRevenue = allOrders.stream()
                .filter(o -> "Completed".equalsIgnoreCase(o.getPaymentStatus()) || "Delivered".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getTotalPrice)
                .sum();

        Map<MenuItem, Long> itemQuantityMap = new HashMap<>();
        for (Order o : allOrders) {
            if (!"Failed".equalsIgnoreCase(o.getPaymentStatus())) {
                for (OrderItem oi : o.getOrderItems()) {
                    MenuItem mi = oi.getMenuItem();
                    itemQuantityMap.put(mi, itemQuantityMap.getOrDefault(mi, 0L) + oi.getQuantity());
                }
            }
        }

        List<PopularItemDto> popularItems = itemQuantityMap.entrySet().stream()
                .map(entry -> new PopularItemDto(
                        entry.getKey().getName(),
                        entry.getKey().getCategory(),
                        entry.getKey().getImageUrl(),
                        entry.getKey().getPrice(),
                        entry.getValue()
                ))
                .sorted((a, b) -> Long.compare(b.getOrderCount(), a.getOrderCount()))
                .limit(5)
                .collect(Collectors.toList());

        List<Order> recentOrders = allOrders.stream()
                .limit(10)
                .peek(o -> {
                    if (o.getUser() != null) {
                        o.getUser().setPassword("");
                    }
                })
                .collect(Collectors.toList());

        DashboardResponse stats = new DashboardResponse(totalOrders, totalRevenue, popularItems, recentOrders);
        return ResponseEntity.ok(stats);
    }
}
