package com.example.controller;

import com.example.model.Product;
import com.example.service.ProductService;
import com.example.dto.ProductDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public Page<ProductDTO> getAllProducts(@RequestParam(value = "search", required = false) String search,
                                          @PageableDefault(size = 10) Pageable pageable) {
        Page<Product> page;
        if (search != null && !search.isEmpty()) {
            page = productService.searchProducts(search, pageable);
        } else {
            page = productService.getAllProducts(pageable);
        }
        return page.map(this::toDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(p -> ResponseEntity.ok(toDTO(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ProductDTO createProduct(@RequestBody Product product, @AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the custom User entity from the database
        if (userDetails == null) {
            throw new IllegalArgumentException("Creator (User) must not be null");
        }
        String username = userDetails.getUsername();
        com.example.model.User creator = productService.findUserByUsername(username);
        if (creator == null) {
            throw new IllegalArgumentException("Creator (User) must not be null");
        }
        Product saved = productService.createProduct(product, creator);
        return toDTO(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody Product productDetails, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<Product> existing = productService.getProductById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Product product = existing.get();
        if (userDetails == null) return ResponseEntity.status(403).build();
        String username = userDetails.getUsername();
        com.example.model.User user = productService.findUserByUsername(username);
        if (user == null) return ResponseEntity.status(403).build();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = product.getCreatedBy() != null && product.getCreatedBy().getId().equals(user.getId());
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).build();
        }
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(toDTO(updatedProduct));
    }
    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCreatedDate(product.getCreatedDate());
        if (product.getCreatedBy() == null) {
            // Defensive: log or handle this case
            dto.setCreatedByUsername("unknown");
        } else {
            dto.setCreatedByUsername(product.getCreatedBy().getUsername());
        }
        return dto;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<Product> existing = productService.getProductById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Product product = existing.get();
        if (userDetails == null) return ResponseEntity.status(403).build();
        String username = userDetails.getUsername();
        com.example.model.User user = productService.findUserByUsername(username);
        if (user == null) return ResponseEntity.status(403).build();
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = product.getCreatedBy() != null && product.getCreatedBy().getId().equals(user.getId());
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
