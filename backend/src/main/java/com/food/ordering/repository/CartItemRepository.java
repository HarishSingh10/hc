package com.food.ordering.repository;

import com.food.ordering.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    Optional<CartItem> findByUserIdAndMenuItemId(Long userId, Long menuItemId);
    void deleteByUserId(Long userId);
}
