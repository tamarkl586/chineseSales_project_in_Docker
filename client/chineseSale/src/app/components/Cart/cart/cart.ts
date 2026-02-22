import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItemModel } from '../../../models/Cart/CartItemModel';
import { CartService } from '../../../services/Cart/cart-service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart implements OnInit {
  items: CartItemModel[] = [];
  totalCartPrice: number = 0;
  totalTickets: number = 0;
  isLoading = false;
  errorMsg = '';

  get validItems(): CartItemModel[] {
    return this.items.filter(i => !i.isDrawn);
  }

  get drawnItems(): CartItemModel[] {
    return this.items.filter(i => i.isDrawn);
  }

  get hasValidItems(): boolean {
    return this.validItems.length > 0;
  }

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.errorMsg = '';
    this.cartService.getMyCart().subscribe({
      next: (res: CartItemModel[]) => {
        this.items = res ?? [];
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('שגיאה בטעינת הסל', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMsg = 'יש להתחבר מחדש כדי לצפות בסל הקניות';
        } else {
          this.errorMsg = err.error?.message || 'שגיאה בטעינת הסל. נסה לרענן את הדף.';
        }
      }
    });
  }

  calculateTotal() {
    const valid = this.validItems;
    this.totalCartPrice = valid.reduce((acc, item) => acc + item.totalPrice, 0);
    this.totalTickets = valid.reduce((acc, item) => acc + item.quantity, 0);
  }

  updateQty(cartId: number, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      this.cartService.updateQuantity(cartId, newQty).subscribe({
        next: () => this.loadCart(),
        error: (err: any) => alert(err.error?.message || 'שגיאה בעדכון כמות')
      });
    }
  }

  removeItem(cartId: number) {
    if (confirm("להסיר את הפריט מהסל?")) {
      this.cartService.remove(cartId).subscribe({
        next: () => this.loadCart(),
        error: (err: any) => alert(err.error?.message || 'שגיאה בהסרת פריט')
      });
    }
  }

  clearCart() {
    if (confirm("האם לנקות את כל הסל?")) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.items = [];
          this.totalCartPrice = 0;
        },
        error: (err: any) => alert(err.error?.message || 'שגיאה בניקוי הסל')
      });
    }
  }

  onPurchase() {
    this.cartService.purchase().subscribe({
      next: () => {
        alert("הרכישה בוצעה בהצלחה! תודה שקנית.");
        this.items = [];
        this.totalCartPrice = 0;
      },
      error: (err: any) => alert(err.error?.message || "שגיאה בביצוע הרכישה")
    });
  }
}
