package com.food.ordering.repository;

import com.food.ordering.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    @Query("SELECT DISTINCT r FROM Restaurant r " +
           "LEFT JOIN MenuItem m ON m.restaurant = r " +
           "WHERE (CAST(:category AS string) IS NULL OR LOWER(m.category) = LOWER(CAST(:category AS string))) " +
           "AND (CAST(:search AS string) IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    List<Restaurant> findByCategoryAndSearch(@Param("category") String category, @Param("search") String search);
}
