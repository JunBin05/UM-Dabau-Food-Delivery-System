package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.ActiveOrderRecord;

/**
 * DB access for active delivery records used by tracking and admin monitoring.
 */
public interface ActiveOrderRepository extends JpaRepository<ActiveOrderRecord, String> {
    // Oldest active orders first, matching queue-style display.
    List<ActiveOrderRecord> findByActiveTrueOrderByTimestampAsc();

    // Used to hydrate pending dispatch orders back into OrderQueue.
    List<ActiveOrderRecord> findByActiveTrueAndStatusOrderByTimestampAsc(String status);

    // Customer tracking should show the latest active order for the current customer.
    Optional<ActiveOrderRecord> findTopByCustomerIdAndActiveTrueOrderByTimestampDesc(String customerId);

    // Fallback when the runtime service has no customer-specific active order in memory.
    Optional<ActiveOrderRecord> findTopByActiveTrueOrderByTimestampDesc();
}
