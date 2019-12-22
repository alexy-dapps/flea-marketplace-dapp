import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import {tap, map } from 'rxjs/operators';

import { INavInterface} from '../../models';

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

};


  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver

  ) {}

  ngOnInit() {

  }
}
