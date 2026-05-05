import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Pipe({ name: 'relativeDate', pure: true })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '—';
    return `há ${formatDistanceToNowStrict(date, { locale: ptBR })}`;
  }
}
