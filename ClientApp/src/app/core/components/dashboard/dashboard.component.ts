import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import * as fromRoot from '../../store';
import { transition, style, animate, trigger } from '@angular/animations';

export const DROP_BUDDY_ANIMATION = trigger('dropPoke', [
  transition(':enter', [   // alias for void => *
    style({ transform: 'translateY(-200px)', opacity: 0 }),
    animate(
      '750ms cubic-bezier(1.000, 0.000, 0.000, 1.000)',
      style({ transform: 'translateY(0)', opacity: 1 })
    ),
  ]),
  /* no need
  transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate(
            '200ms cubic-bezier(1.000, 0.000, 0.000, 1.000)',
            style({ transform: 'translateY(-200px)', opacity: 0 })
        ),
    ]),
  */

]);

export const SHAKE_HANDS_ANIMATION = trigger('shakeHands', [
  transition(':enter', [   // alias for void => *
    style({ opacity: 0 }),
    animate(
      '1s 300ms ease-in',  // Duration is 1 sec, delay is 300 milliseconds, easing in
      style({ opacity: 1 })
    ),
  ]),

]);

@Component({
  selector: 'app-dashboard',
  animations: [DROP_BUDDY_ANIMATION, SHAKE_HANDS_ANIMATION],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ethereumInjected$: Observable<boolean>;
  ethereumConnected$: Observable<boolean>;

  constructor(
    private httpClient: HttpClient,
    private store$: Store<fromRoot.AppState>
  ) { }

  ngOnInit() {
    this.ethereumInjected$ = this.store$.pipe(select(fromRoot.getEthereumInjected));
    this.ethereumConnected$ = this.store$.pipe(select(fromRoot.getEthereumConnected));
  }

  onConnect = () => this.store$.dispatch(fromRoot.Web3GatewayActions.ethereumConnect());
  onDisconnect = () => this.store$.dispatch(fromRoot.Web3GatewayActions.ethereumDisconnect());

  /*
  onDisconnect = () => {
    // error tester block
    // throw new Error('deliberate client error');
    const _emsg = 'deliberate server 401 error';
    this.httpClient.get(_emsg).subscribe();
  }
  */

}
