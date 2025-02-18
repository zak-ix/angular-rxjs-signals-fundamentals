import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  // constructor(private readonly http: HttpClient) {}
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.productsUrl)
      .pipe(tap(() => console.log('in observable pipeline')));
  }

  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http
      .get<Product>(productUrl)
      .pipe(tap(() => console.log('in observable pipe')));
  }
}
