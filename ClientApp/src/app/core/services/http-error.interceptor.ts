import { Injectable, Injector, ErrorHandler } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, retry } from 'rxjs/operators';

// Passes HttpErrorResponse to application global error handler */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      retry(1), // retry one more time
      tap({error: (err: any) => {
          if (err instanceof HttpErrorResponse) {
            // here we inject the global ErrorHandler
            // which will use our custom global error handler AppErrorHandler
            const appErrorHandler = this.injector.get(ErrorHandler);
            appErrorHandler.handleError(err);
          }
        }
      })
    );
  }
}
