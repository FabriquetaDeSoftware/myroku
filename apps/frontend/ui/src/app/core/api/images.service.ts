import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { DockerImage } from './types';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly api = inject(ApiBaseService);

  list(): Observable<DockerImage[]> {
    return this.api.get<DockerImage[]>('/docker/images');
  }
}
