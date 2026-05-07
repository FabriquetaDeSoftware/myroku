import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

@Pipe({ name: 'bytes', pure: true })
export class BytesPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    if (value < 1) return '0 B';
    const i = Math.min(
      UNITS.length - 1,
      Math.floor(Math.log(value) / Math.log(1024)),
    );
    const v = value / Math.pow(1024, i);
    const formatted = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
    return `${formatted} ${UNITS[i]}`;
  }
}
