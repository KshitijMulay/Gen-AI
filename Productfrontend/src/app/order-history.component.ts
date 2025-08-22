import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from './services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrderHistory(0, 10).subscribe((res) => {
      this.orders = res.content;
    });
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );
  }
}
