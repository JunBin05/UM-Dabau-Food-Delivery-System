package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.Restaurant;

/**
 * Stores restaurant records that hydrate RestaurantList and RestaurantHashMap.
 */
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
}
