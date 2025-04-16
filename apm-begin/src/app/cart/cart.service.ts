import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem } from './cart';
import { Product } from '../products/product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  eLength = effect(() =>
    console.log('Cart item length: ', this.cartItems().length)
  );

  cartCount = computed(() =>
    this.cartItems().reduce(
      (accQty, currentCartItem) =>
        Number(accQty) + Number(currentCartItem.quantity),
      0
    )
  );

  subTotal = computed(() =>
    this.cartItems().reduce(
      (accTotal, currentCartItem) =>
        accTotal + currentCartItem.quantity * currentCartItem.product.price,
      0
    )
  );

  deliverFee = computed<number>(() => (this.subTotal() < 50 ? 4.99 : 0));

  tax = computed(() => Math.round(this.subTotal() * 10.75) / 100);

  totalPrice = computed(() => this.subTotal() + this.deliverFee() + this.tax());

  addToCart(product: Product): void {
    this.cartItems.update((items) => {
      let itemIndex = items.findIndex((item) => item.product.id === product.id);
      if (itemIndex === -1) {
        return [...items, { product, quantity: 1 }];
      } else {
        items[itemIndex] = {
          product: items[itemIndex].product,
          quantity: items[itemIndex].quantity + 1,
        };
        return items;
      }
    });
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update((items) =>
      items.map((item) =>
        item.product.id === cartItem.product.id ? { ...item, quantity } : item
      )
    );
  }

  deleteCartItem(cartItem: CartItem): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== cartItem.product.id)
    );
  }
}
