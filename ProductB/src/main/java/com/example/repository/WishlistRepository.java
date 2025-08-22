package com.example.repository;

import com.example.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserId(Long userId);
    
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);
    
    @Transactional
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    @Transactional
    void deleteByUserId(Long userId);
}