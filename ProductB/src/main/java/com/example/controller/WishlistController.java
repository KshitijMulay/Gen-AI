package com.example.controller;

import com.example.model.Product;
import com.example.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE})
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<Product>> getUserWishlist(Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("Getting wishlist for user: " + username);
            List<Product> wishlist = wishlistService.getUserWishlist(username);
            System.out.println("Found " + wishlist.size() + " items in wishlist");
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            System.err.println("Error getting wishlist: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/{productId}")
    public ResponseEntity<String> addToWishlist(@PathVariable Long productId, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("Adding product " + productId + " to wishlist for user: " + username);
            wishlistService.addToWishlist(username, productId);
            System.out.println("Successfully added to wishlist");
            return ResponseEntity.ok("Product added to wishlist");
        } catch (Exception e) {
            System.err.println("Error adding to wishlist: " + e.getMessage());
            return ResponseEntity.status(500).body("Error adding to wishlist: " + e.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeFromWishlist(@PathVariable Long productId, Authentication authentication) {
        String username = authentication.getName();
        wishlistService.removeFromWishlist(username, productId);
        return ResponseEntity.ok("Product removed from wishlist");
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isInWishlist(@PathVariable Long productId, Authentication authentication) {
        String username = authentication.getName();
        boolean isInWishlist = wishlistService.isInWishlist(username, productId);
        return ResponseEntity.ok(isInWishlist);
    }
}