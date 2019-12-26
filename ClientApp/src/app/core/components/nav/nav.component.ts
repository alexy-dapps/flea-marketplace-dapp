import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../core/store/reducers';
import { INavInterface } from '../../models';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  nav: { [index: string]: INavInterface } = {
    home:
    {
      link: '/dashboard',
      name: 'Home',
      img_src: './assets/img/home-start-32.png',
      exact: true
    },
    marketplace:
    {
      link: '/p2p-bazaar',
      name: 'Marketplace',
      img_src: './assets/img/negotiation-64.png',
      exact: true
    },
    marketplace_all_products:
    {
      link: '/p2p-bazaar',
      name: 'All Products',
      img_src: './assets/img/contract-list-24.png',
      exact: true
    },
    marketplace_new_product:
    {
      link: '/p2p-bazaar/products/make/new',
      name: 'New Product',
      img_src: './assets/img/new-contract-24.png',
      exact: true
    },
  };

  account$: Observable<string>;
  balance$: Observable<string>;
  ipfsConnect$: Observable<boolean>;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store<fromRoot.AppState>
  ) { }

  ngOnInit() {
    this.account$ = this.store.pipe(select(fromRoot.getAccount));

    this.balance$ = this.store.pipe(
      select(fromRoot.getBalance),
      tap(balance => console.log(`Debug: got balance: ${balance}`))
    );


  /*  this.ipfsConnect$ = this.store.pipe(
      select(fromRoot.getIpfsConnectStatus),
      tap(ipfs => console.log(`Debug: IPFS connection status: ${ipfs}`))
    );
    */

  }
}