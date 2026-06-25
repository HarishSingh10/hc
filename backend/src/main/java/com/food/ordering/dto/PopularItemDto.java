package com.food.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularItemDto {
    private String name;
    private String category;
    private String imageUrl;
    private Double price;
    private Long orderCount;
}
