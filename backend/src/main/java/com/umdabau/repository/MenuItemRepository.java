package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
}
