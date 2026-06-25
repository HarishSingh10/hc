package com.food.ordering.repository;

import com.food.ordering.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByCategoryIgnoreCase(String category);
    List<MenuItem> findByRestaurantIdAndCategoryIgnoreCase(Long restaurantId, String category);

    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:category IS NULL OR LOWER(m.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MenuItem> findByCategoryAndSearch(@Param("category") String category, @Param("search") String search);
}
