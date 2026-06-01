package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.Restaurant;

public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
}
