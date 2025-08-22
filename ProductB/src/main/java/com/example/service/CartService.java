package com.example.service;

import com.example.model.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;
//    @Autowired
//    private UserRepository userRepository;

    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    public List<CartItem> getCartItems(User user) {
        Cart cart = getOrCreateCart(user);
        return cart.getItems();
    }

    @Transactional
    public Cart addProductToCart(User user, Long productId, int quantity) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(productId).orElseThrow();
        CartItem item = cart.getItems() != null ? cart.getItems().stream()
                .filter(ci -> ci.getProduct().getId().equals(productId)).findFirst().orElse(null) : null;
        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPriceAtAddTime(product.getPrice());
            item.setProductNameAtAddTime(product.getName());
            cartItemRepository.save(item);
            cart.getItems().add(item);
        }
        cartRepository.save(cart);
        return cart;
    }

    @Transactional
    public Cart updateCartItem(User user, Long cartItemId, int quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow();
        if (item.getCart().getId().equals(cart.getId())) {
            if (quantity <= 0) {
                cartItemRepository.delete(item);
                cart.getItems().remove(item);
            } else {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
            }
        }
        cartRepository.save(cart);
        return cart;
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        if (cart.getItems() != null) {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }
}
