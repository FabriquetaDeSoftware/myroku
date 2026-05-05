import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.tokens';

type ParamsLike = HttpParams | Record<string, string | number | boolean>;

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T>(path: string, params?: ParamsLike): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.params(params) });
  }

  post<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  put<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  private params(p?: ParamsLike): HttpParams | undefined {
    if (!p) return undefined;
    if (p instanceof HttpParams) return p;
    let hp = new HttpParams();
    for (const [k, v] of Object.entries(p)) {
      hp = hp.set(k, String(v));
    }
    return hp;
  }
}
