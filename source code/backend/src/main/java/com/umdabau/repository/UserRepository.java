package com.umdabau.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umdabau.models.User;

/**
 * Stores user records that hydrate UserList, UserHashMap, and RiderHeap.
 */
public interface UserRepository extends JpaRepository<User, String> {
}
