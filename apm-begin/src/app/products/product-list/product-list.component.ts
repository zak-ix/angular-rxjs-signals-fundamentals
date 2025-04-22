import { Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, tap } from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe],
})
export class ProductListComponent {
  // Just enough here for the template to compile
  pageTitle = 'Products';

  private productService = inject(ProductService);

  // readonly products$ = this.productService.products$.pipe(
  //   tap(() => console.log('In component pipe')),
  //   catchError((err) => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  readonly products = this.productService.products;
  readonly errorMessage = this.productService.productsError;

  // Selected product id to highlight the entry
  // readonly selectedProductId$ = this.productService.productSelected$;
  selectedProductId = this.productService.selectedProductId;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
