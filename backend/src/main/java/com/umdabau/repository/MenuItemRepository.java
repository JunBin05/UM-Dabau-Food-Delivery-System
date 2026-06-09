package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.MenuItem;

/**
 * Stores menu records that are loaded into MenuBST for search and sorted display.
 */
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
}
