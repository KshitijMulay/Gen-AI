package com.example.controller;

import com.example.model.*;
import com.example.service.CartService;
import com.example.service.ProductService;
import com.example.service.OrderService;
import com.example.dto.CartDTO;
import com.example.dto.CartItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private ProductService productService;
    @Autowired
    private OrderService orderService;

    private User getCurrentUser(UserDetails userDetails) {
        return productService.findUserByUsername(userDetails.getUsername());
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public CartDTO getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Cart cart = cartService.getOrCreateCart(user);
        return toDTO(cart);
    }


    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CartDTO> addToCart(@AuthenticationPrincipal UserDetails userDetails, @RequestParam Long productId, @RequestParam int quantity) {
        User user = getCurrentUser(userDetails);
        Cart cart = cartService.addProductToCart(user, productId, quantity);
        return ResponseEntity.ok(toDTO(cart));
    }


    @PutMapping("/item/{cartItemId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CartDTO> updateCartItem(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long cartItemId, @RequestParam int quantity) {
        User user = getCurrentUser(userDetails);
        Cart cart = cartService.updateCartItem(user, cartItemId, quantity);
        return ResponseEntity.ok(toDTO(cart));
    }
    // Convert Cart entity to CartDTO for safe JSON serialization
    private CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.id = cart.getId();
        dto.items = cart.getItems() == null ? List.of() : cart.getItems().stream().map(item -> {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.id = item.getId();
            itemDTO.productId = item.getProduct().getId();
            itemDTO.productNameAtAddTime = item.getProductNameAtAddTime();
            itemDTO.priceAtAddTime = item.getPriceAtAddTime();
            itemDTO.quantity = item.getQuantity();
            return itemDTO;
        }).collect(Collectors.toList());
        return dto;
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Order> checkout(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        Order order = orderService.checkout(user);
        return ResponseEntity.ok(order);
    }
}
