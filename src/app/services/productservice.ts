import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {ProductModel, ServerResponse} from "../models/product.model";

@Injectable({
  providedIn: 'root'
})
export class Productservice {


  private SERVER_URL = environment.SERVER_URL;


  constructor(private http: HttpClient) { }


  getAllProducts(limitOfResults=10): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(this.SERVER_URL + '/products', {
      params: {
        limit: limitOfResults.toString()
      }
    });
  }

  getSingleProduct(id: number): Observable<ProductModel>{
    return this.http.get<ProductModel>(this.SERVER_URL + '/products/' + id);
  }


  getProductsFromCategory(catName: string): Observable<ProductModel[]>{
    return this.http.get<ProductModel[]>(this.SERVER_URL + '/products/category/' + catName)
  }
}
