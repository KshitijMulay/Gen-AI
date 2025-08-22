import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { AdminService } from './services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, MatTableModule, MatCardModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  products: any[] = [];
  orders: any[] = [];
  carts: any[] = [];
  wishlists: any[] = [];
  
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  };

  selectedUser: any = null;
  showUserDetails = false;
  showUserDetailsPanel = false;
  userProducts: any[] = [];
  userOrders: any[] = [];
  userCarts: any[] = [];
  userWishlists: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    console.log('Loading admin dashboard data...');
    
    this.adminService.getAllUsers().subscribe({
      next: users => {
        console.log('Users loaded:', users);
        this.users = users;
        this.stats.totalUsers = users.length;
      },
      error: err => {
        console.error('Error loading users:', err);
        this.users = [];
      }
    });

    this.adminService.getAllProducts().subscribe({
      next: products => {
        console.log('Products loaded:', products);
        this.products = products;
        this.stats.totalProducts = products.length;
      },
      error: err => {
        console.error('Error loading products:', err);
        this.products = [];
      }
    });

    this.adminService.getAllOrders().subscribe({
      next: orders => {
        console.log('Orders loaded:', orders);
        this.orders = orders;
        this.stats.totalOrders = orders.length;
        this.stats.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      },
      error: err => {
        console.error('Error loading orders:', err);
        this.orders = [];
      }
    });

    this.adminService.getAllCarts().subscribe({
      next: carts => {
        console.log('Carts loaded:', carts);
        this.carts = carts;
      },
      error: err => {
        console.error('Error loading carts:', err);
        this.carts = [];
      }
    });

    this.adminService.getAllWishlists().subscribe({
      next: wishlists => {
        console.log('Wishlists loaded:', wishlists);
        this.wishlists = wishlists;
      },
      error: err => {
        console.error('Error loading wishlists:', err);
        this.wishlists = [];
      }
    });
  }

  viewUserDetails(user: any) {
    this.selectedUser = user;
    this.showUserDetails = true;
    console.log('Viewing details for user:', user);
    this.loadUserSpecificData(user.username);
    
    // Show user details in a modal or navigate to detailed view
    const userProducts = this.products.filter(p => p.createdByUsername === user.username);
    const userOrders = this.orders.filter(o => o.username === user.username);
    const userCarts = this.carts.filter(c => c.username === user.username);
    const userWishlists = this.wishlists.filter(w => w.username === user.username);
    
    const summary = `
    User: ${user.username}
    Role: ${user.role}
    Products Listed: ${userProducts.length}
    Orders Placed: ${userOrders.length}
    Cart Items: ${userCarts.length}
    Wishlist Items: ${userWishlists.length}
    `;
    
    // Show user details in dedicated section
    this.showUserDetailsPanel = true;
  }



  closeUserDetails() {
    this.showUserDetailsPanel = false;
    this.selectedUser = null;
  }

  loadUserSpecificData(username: string) {
    this.userProducts = this.products.filter(p => p.createdByUsername === username);
    this.userOrders = this.orders.filter(o => o.username === username);
    this.userCarts = this.carts.filter(c => c.username === username);
    this.userWishlists = this.wishlists.filter(w => w.username === username);
  }
}