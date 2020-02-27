//  https://medium.com/angular-in-depth/expecting-the-unexpected-best-practices-for-error-handling-in-angular-21c3662ef9e4

// https://www.tektutorialshub.com/angular/error-handling-in-angular-applications/
// https://www.freecodecamp.org/news/global-error-handling-in-angular-with-the-help-of-the-cdk/
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {

  // Error handling is important and needs to be loaded first.
  // Because of this we should manually inject the services with Injector.
  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse) {

    let message;

    if (error instanceof HttpErrorResponse) {
      // Server Error
      message = error.message;

    } else {
      // Client Error
      message = error.message ? error.message : error.toString();
    }
    console.error('unhandled error', error);


  }

}
