import { Component, OnInit } from '@angular/core';
import {Productservice} from "../../services/productservice";
import {ProductModel, ServerResponse} from "../../models/product.model";
import {Router} from "@angular/router";
import {CartService} from "../../services/cart.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: ProductModel[] = [];

  constructor(private productService: Productservice, private router: Router, private cartService: CartService) { }

  ngOnInit() {
    this.productService.getAllProducts(10).subscribe((prods: any) => {
      this.products = prods.products;
    });
  }

  selectProduct(id: Number) {
    this.router.navigate(['/product', id]).then()
  }


  addProduct(id: number){
    this.cartService.addProductToCart(id)

  }
}
