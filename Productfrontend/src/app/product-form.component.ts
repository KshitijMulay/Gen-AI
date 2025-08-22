import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from './services/product.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  error: string | null = null;
  isEdit = false;
  productId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  // amazonq-ignore-next-line
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.productId = +id;
        this.productService.getProductById(this.productId).subscribe({
          next: (product) => {
            this.productForm.patchValue(product);
          },
          // amazonq-ignore-next-line
          error: () => {
            this.error = 'Failed to load product.';
          },
        });
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.loading = true;
    this.error = null;
    const formValue = this.productForm.value;
    
    if (this.isEdit && this.productId != null) {
      this.productService.updateProduct(this.productId, formValue).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/profile']);
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to update product.';
        },
      });
    } else {
      this.productService.addProduct(formValue).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/profile']);
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to add product.';
        },
      });
    }
  }
  
  goBack() {
    this.router.navigate(['/profile']);
  }

  resetForm() {
    // amazonq-ignore-next-line
    this.productForm.reset({ name: '', description: '', price: 0 });
  }
}
