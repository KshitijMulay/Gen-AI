package com.example.controller;

import com.example.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/carts")
    public ResponseEntity<List<Map<String, Object>>> getAllCarts() {
        return ResponseEntity.ok(adminService.getAllCarts());
    }

    @GetMapping("/wishlists")
    public ResponseEntity<List<Map<String, Object>>> getAllWishlists() {
        return ResponseEntity.ok(adminService.getAllWishlists());
    }

    @GetMapping("/stats/users")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        return ResponseEntity.ok(adminService.getUserStats());
    }

    @GetMapping("/stats/products")
    public ResponseEntity<Map<String, Object>> getProductStats() {
        return ResponseEntity.ok(adminService.getProductStats());
    }

    @GetMapping("/stats/orders")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        return ResponseEntity.ok(adminService.getOrderStats());
    }
}