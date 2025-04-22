import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Product, Result } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { Review } from '../reviews/review';
import { ReviewService } from '../reviews/review.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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

  // private productSelectedSubject = new BehaviorSubject<number | undefined>(
  //   undefined
  // );
  // readonly productSelected$ = this.productSelectedSubject.asObservable();
  selectedProductId = signal<number | undefined>(undefined);

  private productsResult$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((p) => ({ data: p } as Result<Product[]>)),
    tap(() => console.log('in observable pipeline')),
    shareReplay(1),
    catchError((err) =>
      of({ data: [], error: this.errorService.formatError(err) } as Result<
        Product[]
      >)
    )
  );

  private productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [] } as Result<Product[]>,
  });

  readonly products = computed(() => this.productsResult().data);
  readonly productsError = computed(() => this.productsResult().error);

  // readonly product$ = this.productSelected$.pipe(
  //   filter(Boolean),
  //   switchMap((id) => {
  //     const productUrl = this.productsUrl + '/' + id;
  //     return this.http.get<Product>(productUrl).pipe(
  //       switchMap((product) => this.getProductsWithReviews(product)),
  //       catchError((err) => this.handleError(err))
  //     );
  //   })
  // );

  private productResult$ = toObservable(this.selectedProductId).pipe(
    filter(Boolean),
    switchMap((id) => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductsWithReviews(product)),
        catchError((err) =>
          of({ data: undefined, error: err } as Result<Product>)
        )
      );
    }),
    map((p) => ({ data: p } as Result<Product>))
  );

  private productResult = toSignal(this.productResult$);

  readonly product = computed(() => this.productResult()?.data);
  readonly productError = computed(() => this.productResult()?.error);

  // product$ = combineLatest([
  //   this.products$,
  //   this.productSelected$,
  // ]).pipe(
  //   map(([products, selectedProduct]) =>
  //     products.find((product) => product.id === selectedProduct)
  //   ),
  //   filter(Boolean),
  //   switchMap((product) => this.getProductsWithReviews(product)),
  //   catchError((err) => this.handleError(err))
  // );

  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl).pipe(
      tap(() => console.log('in observable pipe')),
      switchMap((product) => this.getProductsWithReviews(product)),
      tap((c) => console.log(c)),
      catchError((err) => this.handleError(err))
    );
  }

  productSelected(selectedProduct: number): void {
    // this.productSelectedSubject.next(selectedProduct);
    this.selectedProductId.set(selectedProduct);
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
