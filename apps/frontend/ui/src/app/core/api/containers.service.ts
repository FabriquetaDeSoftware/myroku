import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { Container } from './types';

@Injectable({ providedIn: 'root' })
export class ContainersService {
  private readonly api = inject(ApiBaseService);

  list(): Observable<Container[]> {
    return this.api.get<Container[]>('/docker/containers');
  }
}
