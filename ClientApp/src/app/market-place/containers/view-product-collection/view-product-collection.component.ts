
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as fromStore from '../../store/reducers';
import { PurchaseWidgetModel } from '../../models';

@Component({
  selector: 'app-view-product-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './view-product-collection.component.html',

})
export class ViewProductCollectionComponent implements OnInit, AfterViewInit {


  @ViewChild('contractKey') contractKey: ElementRef;

  filteredProducts$: Observable<PurchaseWidgetModel[]>;

  constructor(
    private store$: Store<fromStore.AppState>,
    private router: Router

  ) { }

  /*based on https://alligator.io/angular/viewchild-access-component/
      *Notice that we wait for the AfterViewInit lifecycle hook to access our variable,
      * as this is when child components/DOM elements and directives become available
      *
      * */
  ngAfterViewInit() {
    const products$ = this.store$.pipe(select(fromStore.getAllProducts));

    const filter$ = fromEvent(this.contractKey.nativeElement, 'keyup').pipe(
      map(event => this.contractKey.nativeElement.value),
      startWith(''),
      debounceTime(150),
      distinctUntilChanged());

    this.filteredProducts$ = combineLatest([products$, filter$]).pipe(
      map(([products, filterString]) => products.filter(product => product.productKey.indexOf(filterString) !== -1))
    );

    // based on https://blog.angular-university.io/angular-debugging/
    setTimeout(() => {
      this.contractKey.nativeElement.focus();
    }, 150);

  }

  selectPurchaseContract(product: PurchaseWidgetModel) {
    this.router.navigate(['market-place/products', product.productKey]);
  }

  ngOnInit() {

  }


}



