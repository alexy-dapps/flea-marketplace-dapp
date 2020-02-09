import { Injectable } from '@angular/core';

// cdk
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

import { Observable, Subject } from 'rxjs';
import { scan, map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SpinnerOverlayService {

    private spinnerTopRef: OverlayRef;
    private spin$: Subject<number> = new Subject();

    constructor(private overlay: Overlay) {

        this.spinnerTopRef = this.overlay.create({
            hasBackdrop: true,
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically()
        });

        this.spin$
            .asObservable()
            .pipe(
                /*
                Combines together all values emitted on the source,
                using an accumulator function that knows how to join a new source value
                into the accumulation from the past.
                */
                scan((acc, next) => {
                    // The (!) operator reverses the logical (true or false)
                    // !0 - is true,  (!5) is false
                    if (!next) {
                        return 0;
                    }
                    return (acc + next) >= 0 ? acc + next : 0;
                }, 0),

                map(val => val > 0),
                distinctUntilChanged()
            )
            .subscribe(
                (res) => {
                    if (res) {
                        this.spinnerTopRef.attach(new ComponentPortal(MatSpinner));
                    } else if (this.spinnerTopRef.hasAttached()) {
                        this.spinnerTopRef.detach();
                    }
                }
            );
    }

    show = () => this.spin$.next(1);

    hide = () => this.spin$.next(-1);

    reset = () => this.spin$.next(0);

}
