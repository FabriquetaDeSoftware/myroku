import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

function humanize(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Sem conexão com o servidor.';
  }
  if (err.status >= 500) {
    return 'Erro interno do servidor.';
  }
  const backendMessage =
    typeof err.error === 'string'
      ? err.error
      : (err.error?.message as string | undefined);
  return backendMessage ?? `${err.status} ${err.statusText}`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      toast.error(humanize(err));
      return throwError(() => err);
    }),
  );
};
