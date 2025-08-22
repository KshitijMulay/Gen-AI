package com.example.service;

import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    public List<Map<String, Object>> getAllUsers() {
        try {
            return userRepository.findAll().stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("username", user.getUsername());
                        userMap.put("role", user.getRole() != null ? user.getRole().name() : "USER");
                        userMap.put("createdDate", user.getCreatedDate());
                        return userMap;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching users: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getAllProducts() {
        return productRepository.findAll().stream()
                .map(product -> {
                    Map<String, Object> productMap = new HashMap<>();
                    productMap.put("id", product.getId());
                    productMap.put("name", product.getName());
                    productMap.put("description", product.getDescription());
                    productMap.put("price", product.getPrice());
                    productMap.put("quantity", product.getQuantity());
                    productMap.put("createdDate", product.getCreatedDate());
                    productMap.put("createdByUsername", 
                        product.getCreatedBy() != null ? product.getCreatedBy().getUsername() : "Unknown");
                    return productMap;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllOrders() {
        try {
            return orderRepository.findAll().stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("id", order.getId());
                        orderMap.put("username", order.getUser().getUsername());
                        orderMap.put("total", order.getTotal() != null ? order.getTotal() : 0.0);
                        orderMap.put("status", order.getStatus());
                        orderMap.put("orderDate", order.getOrderDate());
                        return orderMap;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getAllCarts() {
        try {
            return cartItemRepository.findAll().stream()
                    .map(cartItem -> {
                        Map<String, Object> cartMap = new HashMap<>();
                        cartMap.put("username", cartItem.getCart().getUser().getUsername());
                        cartMap.put("productName", cartItem.getProduct().getName());
                        cartMap.put("quantity", cartItem.getQuantity());
                        cartMap.put("addedDate", cartItem.getAddedDate());
                        return cartMap;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching carts: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getAllWishlists() {
        try {
            return wishlistRepository.findAll().stream()
                    .map(wishlist -> {
                        Map<String, Object> wishlistMap = new HashMap<>();
                        wishlistMap.put("username", wishlist.getUser().getUsername());
                        wishlistMap.put("productName", wishlist.getProduct().getName());
                        wishlistMap.put("addedDate", wishlist.getAddedDate());
                        return wishlistMap;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching wishlists: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("adminUsers", userRepository.countByRole(com.example.model.Role.ADMIN));
        stats.put("regularUsers", userRepository.countByRole(com.example.model.Role.USER));
        return stats;
    }

    public Map<String, Object> getProductStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.count());
        return stats;
    }

    public Map<String, Object> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderRepository.count());
        return stats;
    }
}