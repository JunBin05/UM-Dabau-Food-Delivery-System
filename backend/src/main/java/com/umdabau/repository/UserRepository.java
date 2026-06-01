package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.User;

public interface UserRepository extends JpaRepository<User, String> {
}
