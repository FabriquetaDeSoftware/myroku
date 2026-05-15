import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { SystemDF } from './types';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly api = inject(ApiBaseService);

  df(): Observable<SystemDF> {
    return this.api.get<SystemDF>('/docker/system/df');
  }
}
