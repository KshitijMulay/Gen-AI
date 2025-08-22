# Database Setup Instructions

## Wishlist Table Creation

The wishlist table will be automatically created when you run the Spring Boot application due to the `spring.jpa.hibernate.ddl-auto=update` configuration.

However, if you want to create it manually, run this SQL:

```sql
-- Create Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);
```

## API Endpoints

The following wishlist endpoints are now available:

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/{productId}` - Add product to wishlist
- `DELETE /api/wishlist/{productId}` - Remove product from wishlist
- `GET /api/wishlist/check/{productId}` - Check if product is in wishlist

All endpoints require JWT authentication.

## Security Configuration

- Products endpoint (`/api/products`) is now public (no authentication required)
- All other endpoints require authentication
- Wishlist data is user-specific and secure