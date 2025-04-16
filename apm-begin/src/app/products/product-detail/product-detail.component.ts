import { Component, inject } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { catchError, EMPTY, tap } from 'rxjs';
import { ProductService } from '../product.service';
import { CartService } from 'src/app/cart/cart.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe],
})
export class ProductDetailComponent {
  errorMessage = '';
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  readonly product$ = this.productService.product$.pipe(
    tap(() => console.log('in subscription')),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // Set the page title
  pageTitle = 'product details';

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
