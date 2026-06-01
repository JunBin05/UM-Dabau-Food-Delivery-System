package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.CartActionRecord;

public interface CartActionRepository extends JpaRepository<CartActionRecord, Long> {
    List<CartActionRecord> findByCustomerIdOrderByIdAsc(String customerId);

    List<CartActionRecord> findByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    long countByCustomerIdAndMenuItemId(String customerId, String menuItemId);

    Optional<CartActionRecord> findTopByCustomerIdOrderByIdDesc(String customerId);

    Optional<CartActionRecord> findTopByCustomerIdAndMenuItemIdOrderByIdDesc(String customerId, String menuItemId);

    long countByCustomerId(String customerId);
}
