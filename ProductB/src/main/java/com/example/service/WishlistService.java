package com.example.service;

import com.example.model.Product;
import com.example.model.User;
import com.example.model.Wishlist;
import com.example.repository.ProductRepository;
import com.example.repository.UserRepository;
import com.example.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getUserWishlist(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return wishlistRepository.findByUserId(user.getId())
            .stream()
            .map(wishlist -> {
                Product product = wishlist.getProduct();
                // Create a new Product object to avoid proxy issues
                Product cleanProduct = new Product();
                cleanProduct.setId(product.getId());
                cleanProduct.setName(product.getName());
                cleanProduct.setDescription(product.getDescription());
                cleanProduct.setPrice(product.getPrice());
                cleanProduct.setCreatedDate(product.getCreatedDate());
                // Don't set createdBy to avoid proxy issues
                return cleanProduct;
            })
            .collect(Collectors.toList());
    }

    public void addToWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already exists
        if (wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            return; // Already in wishlist
        }

        Wishlist wishlist = new Wishlist(user, product);
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public boolean isInWishlist(String username, Long productId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent();
    }
}