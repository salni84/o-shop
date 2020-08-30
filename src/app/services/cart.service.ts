import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Productservice} from "./productservice";
import {OrderService} from "./order.service";
import {environment} from "../../environments/environment";
import {CartModelPublic, CartModelServer} from "../models/cart.models";
import {BehaviorSubject} from "rxjs";
import {NavigationExtras, Router} from "@angular/router";
import {ProductModel} from "../models/product.model";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";


@Injectable({
  providedIn: 'root'
})

export class CartService {

  private serverUrl = environment.SERVER_URL;

  private cartDataClient: CartModelPublic = {

    total: 0,
    prodData: [{
      incart: 0,
      id: 0
    }]
  };

  private cartDataServer: CartModelServer = {

    total: 0,
    data: [{
      numInCart: 0,
      product: undefined
    }]
  };


  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);


  constructor(private http: HttpClient,
              private productService: Productservice,
              private orderService: OrderService,
              private router: Router,
              private toast: ToastrService,
              private spinner: NgxSpinnerService) {

    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart'));

    if (info != null && info.prodData[0].incart != 0){
      this.cartDataClient =  info;


      this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProductInfo: ProductModel) => {
          if (this.cartDataServer.data[0].numInCart == 0){
            this.cartDataServer.data[0].numInCart = p.incart;
            this.cartDataServer.data[0].product = actualProductInfo;

            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient))
          }else {
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProductInfo
            });

            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient))
          }

          this.cartData$.next({
            ...this.cartDataServer});
        });
      });
    }
  }


  calculateSubtotal(index): number{
      let subtotal = 0;
      const p = this.cartDataServer.data[index];
      subtotal = p.product.price * p.numInCart;
      return subtotal
    }

  addProductToCart(id: number, quantity?: number ){
      this.productService.getSingleProduct(id).subscribe(prod => {
        if (this.cartDataServer.data[0].product == undefined){
          this.cartDataServer.data[0].product = prod;
          this.cartDataServer.data[0].numInCart = quantity != undefined ? quantity : 1;
          this.calculateTotal();
          this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
          this.cartDataClient.prodData[0].id = prod.id;
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({...this.cartDataServer});
          this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          } )
        }

        else {
          let index = this.cartDataServer.data.findIndex(p => p.product.id == prod.id);

          if(index != -1){
            if (quantity != undefined && quantity < prod.quantity) {
              this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity: prod.quantity
            }
            else {
              this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
            }

            this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.toast.info(`${prod.name} quantitiy updated in the cart`, 'Product Updated', {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right'
            } );

          }

        else {
          this.cartDataServer.data.push({
            numInCart: 1,
            product: prod
          });

          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id
          });

            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right'
            } );

            this.calculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({...this.cartDataServer});
          }
        }
      })
  }

updateCartItems(index: number, increase: boolean){
    let data = this.cartDataServer.data[index];

    if (increase){
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataClient.prodData[index].incart = data.numInCart;


      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({...this.cartDataServer});
    }
    else {
      data.numInCart--;

      if (data.numInCart < 1){
        this.cartData$.next({...this.cartDataServer});
      }
      else {
        this.cartData$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].incart = data.numInCart;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
}

deleteProductFromCart(index: number){
    if (window.confirm('Are you sure you want to remove the item?')){
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      this.calculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total == 0){
        this.cartDataClient = {
          total: 0,
          prodData: [{
            incart: 0,
            id: 0
          }]
        }
      }else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
      if (this.cartDataServer.total == 0){
        this.cartDataServer = {
          total: 0,
          data: [{
            numInCart: 0,
            product: undefined
          }]
        };
        this.cartData$.next({...this.cartDataServer})
      }
      else {
        this.cartData$.next({...this.cartDataServer})
      }
    }
    else {
      return;
    }
}



checkoutFromCart(userId: number){
    this.http.post(`${this.serverUrl}/orders/payment`, null).subscribe((res: {success: boolean})=> {
     console.clear();
      if (res.success){
    this.resetServerData();
    this.http.post(`${this.serverUrl}/orders/new`, {
      userId: userId,
      products: this.cartDataClient.prodData
    }).subscribe((data: OrderConfirmationResponse) => {

      this.orderService.getSingleOrder(data.order_id).then(prods => {
        if (data.success) {
          const navigationExtras: NavigationExtras = {
            state: {
              message: data.message,
              products: prods,
              orderId: data.order_id,
              total: this.cartDataClient.total
            }
          };


          this.spinner.show();

          this.router.navigate(['/thankyou'], navigationExtras).then( p => {
            this.cartDataClient = { prodData: [{incart: 0, id: 0}], total: 0};
            this.cartTotal$.next(0);
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          });
        }
      });
    })

        } else {
          this.spinner.hide();
          this.router.navigateByUrl('/checkout').then();
          this.toast.error(`Sorry, failed to book the order`, 'Order Status ', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
      })
    }

    private calculateTotal(){
        let total = 0;

        this.cartDataServer.data.forEach( p => {
          const {numInCart} = p;
          const {price} = p.product;

          total += numInCart * price;
        });
        this.cartDataServer.total = total;
        this.cartTotal$.next(this.cartDataServer.total);
      }



    private resetServerData(){
        this.cartDataServer = {

          data: [{
            numInCart: 0,
            product: undefined,
          }],
          total: 0
        };
        this.cartData$.next({...this.cartDataServer});
      }
      }



interface OrderConfirmationResponse {
  order_id: number,
  success: boolean,
  message: string,
  products: [{
    id: string,
    numInCart: string
  }]
}
