package com.food.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String category;
    private boolean available = true;
    private Long restaurantId;
}
