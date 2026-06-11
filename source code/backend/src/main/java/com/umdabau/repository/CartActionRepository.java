package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.CartActionRecord;

/**
 * Repository for optional persisted cart action history.
 */
public interface CartActionRepository extends JpaRepository<CartActionRecord, Long> {
    // Read actions in the same order they were stored.
    List<CartActionRecord> findByCustomerIdOrderByIdAsc(String customerId);

    List<CartActionRecord> findByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    long countByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    Optional<CartActionRecord> findTopByCustomerIdOrderByIdDesc(String customerId);

    Optional<CartActionRecord> findTopByCustomerIdAndMenuItemIdOrderByIdDesc(String customerId, String menuItemId);

    long countByCustomerId(String customerId);
}
