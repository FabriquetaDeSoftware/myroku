import { Component, computed, inject, input } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { ThemeService } from '../../../core/theme/theme.service';
import { Application } from '../../../core/api/types';

interface DeploysPerHourSeries {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  fill: ApexFill;
  plotOptions: ApexPlotOptions;
}

interface ContainerDonut {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  responsive: ApexResponsive[];
  legend: { position: 'bottom' | 'top' | 'right' | 'left' };
}

@Component({
  selector: 'app-dashboard-charts',
  imports: [NgApexchartsModule],
  template: `
    <div class="grid gap-4 md:grid-cols-3">
      <article
        class="rounded-2xl border p-5 md:col-span-2"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          Deploys por hora · 24h
        </h3>
        <apx-chart
          [series]="deploysChart().series"
          [chart]="deploysChart().chart"
          [xaxis]="deploysChart().xaxis"
          [fill]="deploysChart().fill"
          [plotOptions]="deploysChart().plotOptions"
        />
      </article>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          Status dos containers
        </h3>
        <apx-chart
          [series]="containersChart().series"
          [chart]="containersChart().chart"
          [labels]="containersChart().labels"
          [colors]="containersChart().colors"
          [responsive]="containersChart().responsive"
          [legend]="containersChart().legend"
        />
      </article>
    </div>
  `,
})
export class DashboardChartsComponent {
  readonly apps = input.required<Application[]>();

  private readonly theme = inject(ThemeService);

  private readonly textColor = computed(() =>
    this.theme.current() === 'dark' ? '#a1a1aa' : '#71717a',
  );

  readonly deploysChart = computed<DeploysPerHourSeries>(() => {
    const data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 5));
    return {
      series: [{ name: 'Deploys', data }],
      chart: {
        type: 'bar',
        height: 220,
        toolbar: { show: false },
        foreColor: this.textColor(),
        background: 'transparent',
        fontFamily: 'Inter Variable, sans-serif',
      },
      xaxis: {
        categories: Array.from({ length: 24 }, (_, i) => `${i}h`),
        labels: { rotate: 0, hideOverlappingLabels: true },
      },
      fill: { colors: ['#10b981'] },
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '60%' },
      },
    };
  });

  readonly containersChart = computed<ContainerDonut>(() => {
    const all = this.apps();
    const running = all.filter((a) => a.status === 'running').length;
    const stopped = all.filter((a) => a.status === 'stopped').length;
    const failed = all.filter((a) => a.status === 'failed').length;
    const pending = all.filter((a) => a.status === 'pending').length;

    return {
      series: [running, stopped, failed, pending],
      chart: {
        type: 'donut',
        height: 240,
        foreColor: this.textColor(),
        background: 'transparent',
        fontFamily: 'Inter Variable, sans-serif',
      },
      labels: ['Running', 'Stopped', 'Failed', 'Pending'],
      colors: ['#10b981', '#71717a', '#ef4444', '#f59e0b'],
      responsive: [
        {
          breakpoint: 768,
          options: { chart: { height: 200 } },
        },
      ],
      legend: { position: 'bottom' },
    };
  });
}
