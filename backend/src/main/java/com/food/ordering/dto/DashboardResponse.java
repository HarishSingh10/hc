package com.food.ordering.dto;

import com.food.ordering.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalOrders;
    private Double totalRevenue;
    private List<PopularItemDto> popularItems;
    private List<Order> recentOrders;
}
