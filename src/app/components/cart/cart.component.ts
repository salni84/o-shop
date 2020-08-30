import { Component, OnInit } from '@angular/core';
import {CartModelServer} from "../../models/cart.models";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartData: CartModelServer;
  cartTotal: number;
  subTotal: number;

  constructor(public cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.cartData$.subscribe(data => this.cartData = data);
    this.cartService.cartTotal$.subscribe(total => this.cartTotal = total)
  }

  ChangeQuantity(index: number, increase: boolean) {
    this.cartService.updateCartItems(index, increase)

  }
}
