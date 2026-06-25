package com.food.ordering.dto;

import com.food.ordering.entity.Role;
import com.food.ordering.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Restaurant restaurant;
    private List<String> addresses;

    // Constructor without addresses for backward compatibility (login/signup)
    public AuthResponse(String token, Long id, String name, String email, Role role, Restaurant restaurant) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.restaurant = restaurant;
        this.addresses = null;
    }
}

