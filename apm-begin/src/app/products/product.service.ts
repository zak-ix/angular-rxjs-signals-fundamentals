import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { Review } from '../reviews/review';
import { ReviewService } from '../reviews/review.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  // constructor(private readonly http: HttpClient) {}
  private readonly http = inject(HttpClient);
  private readonly errorService = inject(HttpErrorService);
  private readonly reviewService = inject(ReviewService);

  readonly products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap(() => console.log('in observable pipeline')),
    shareReplay(1),
    catchError((err) => this.handleError(err))
  );

  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl).pipe(
      tap(() => console.log('in observable pipe')),
      switchMap((product) => this.getProductsWithReviews(product)),
      tap((c) => console.log(c)),
      catchError((err) => this.handleError(err))
    );
  }

  private getProductsWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews } as Product)));
    } else {
      return of(product);
    }
  }

  handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    throw formattedMessage;
  }
}
