package com.umdabau.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.ActiveOrderRecord;

public interface ActiveOrderRepository extends JpaRepository<ActiveOrderRecord, String> {
    List<ActiveOrderRecord> findByActiveTrueOrderByTimestampAsc();

    List<ActiveOrderRecord> findByActiveTrueAndStatusOrderByTimestampAsc(String status);

    Optional<ActiveOrderRecord> findTopByCustomerIdAndActiveTrueOrderByTimestampDesc(String customerId);

    Optional<ActiveOrderRecord> findTopByActiveTrueOrderByTimestampDesc();
}
