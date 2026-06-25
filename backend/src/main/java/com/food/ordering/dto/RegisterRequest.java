package com.food.ordering.dto;

import com.food.ordering.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role; // Optional, defaults to CUSTOMER
    private Long restaurantId; // Optional, for SHOP_OWNER
    private String newRestaurantName; // Optional, to register new restaurant
    private String newRestaurantAddress;
    private String newRestaurantDescription;
}
