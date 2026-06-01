package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.CartItemRecord;

public interface CartItemRepository extends JpaRepository<CartItemRecord, Long> {
    List<CartItemRecord> findByCustomerIdOrderByIdAsc(String customerId);

    List<CartItemRecord> findByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    Optional<CartItemRecord> findFirstByCustomerIdAndMenuItemIdOrderByIdAsc(String customerId, String menuItemId);

    Optional<CartItemRecord> findTopByCustomerIdOrderByIdDesc(String customerId);
}
