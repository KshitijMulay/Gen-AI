package com.example.controller;

import com.example.model.Order;
import com.example.model.User;
import com.example.service.OrderService;
import com.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private ProductService productService;

    private User getCurrentUser(UserDetails userDetails) {
        return productService.findUserByUsername(userDetails.getUsername());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<Order>> getOrderHistory(@AuthenticationPrincipal UserDetails userDetails,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderService.getOrderHistory(user, pageable);
        return ResponseEntity.ok(orders);
    }
}
