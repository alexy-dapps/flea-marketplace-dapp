import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { create } from 'ethereum-blockies';

import * as fromRoot from '../../../core/store/reducers';
import { INavInterface } from '../../models';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, AfterViewInit {

  @ViewChild('blocky') blockyRef: ElementRef;

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
      link: '/market-place',
      name: 'Marketplace',
      img_src: './assets/img/negotiation-64.png',
      exact: true
    },
    marketplace_all_products:
    {
      link: '/market-place',
      name: 'All Products',
      img_src: './assets/img/contract-list-24.png',
      exact: true
    },
    marketplace_new_product:
    {
      link: '/market-place/products/make/new',
      name: 'New Product',
      img_src: './assets/img/new-contract-24.png',
      exact: true
    },

  };

  account$: Observable<string>;
  network$: Observable<string>;
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
    this.network$ = this.store.pipe(select(fromRoot.getNetwork));
    this.balance$ = this.store.pipe(
      select(fromRoot.getBalance),
      tap(balance => console.log(`Debug: got balance: ${balance}`))
    );

    this.ipfsConnect$ = this.store.pipe(
      select(fromRoot.getIpfsConnectStatus),
      tap(ipfs => console.log(`Debug: IPFS connection status: ${ipfs}`))
    );

  }

  ngAfterViewInit() {

    this.account$ = this.store.pipe(select(fromRoot.getAccount)).pipe(
      // filter(account => !!account),
      tap(account => {
        console.log(`Debug: got account: ${account}`);
        this.blockyRef.nativeElement.src = create({ seed: account, size: 8, scale: 4 }).toDataURL();
      })
    );
  }

}
