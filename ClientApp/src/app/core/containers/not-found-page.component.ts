import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `
    <mat-card>
      <mat-card-title>404: Not Found</mat-card-title>
      <mat-card-subtitle>
        <p>Sorry! This page may not exist yet.</p>
      </mat-card-subtitle>
      <mat-card-actions>
        <button mat-raised-button color="warn" routerLink="/">Back To Home</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      :host {
        text-align: center;
      }
    `,
  ],
})
export class NotFoundPageComponent {}
