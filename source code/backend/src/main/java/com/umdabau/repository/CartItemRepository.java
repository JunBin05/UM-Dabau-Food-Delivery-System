package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.CartItemRecord;

/**
 * DB access for the customer's cart.
 * The controller hydrates these rows back into CartStack when needed.
 */
public interface CartItemRepository extends JpaRepository<CartItemRecord, Long> {
    // Preserve insertion order when rebuilding the cart stack.
    List<CartItemRecord> findByCustomerIdOrderByIdAsc(String customerId);

    List<CartItemRecord> findByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    Optional<CartItemRecord> findFirstByCustomerIdAndMenuItemIdOrderByIdAsc(String customerId, String menuItemId);

    Optional<CartItemRecord> findTopByCustomerIdOrderByIdDesc(String customerId);
    long countByCustomerId(String customerId);
}
