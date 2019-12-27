import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-marketplace-home',
  templateUrl: './market-place-home.component.html',
})
export class MarketPlaceHomeComponent implements OnInit  {

  name$: Observable<string>;

  constructor(

  ) { }

  ngOnInit() {

  }

}
