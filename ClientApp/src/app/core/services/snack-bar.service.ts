import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../components/snackbar/snack-bar.component';
import { SnackBarInterface } from '../models';


@Injectable({ providedIn: 'root' })
export class SnackBarService {

  static readonly SNACKBAR_DELAY: number = 7000;

  constructor(private matSnackBar: MatSnackBar) { }

  show(messageInfo: SnackBarInterface): void {
    this.matSnackBar.openFromComponent(SnackBarComponent, {
      data: {
        message: messageInfo.message,
        color: messageInfo.color
      },
      duration: SnackBarService.SNACKBAR_DELAY,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

}
