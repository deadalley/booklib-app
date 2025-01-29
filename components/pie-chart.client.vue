<template>
  <apexchart
    type="pie"
    :height="height"
    width="100%"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script setup lang="ts" generic="T">
import type { ApexOptions } from 'apexcharts'
import Color from 'color'

export type PieChartItem<P> = {
  label: string
  description?: string
  value: P
}

const props = defineProps<{
  items: PieChartItem<T>[]
  height?: number
  showPercentages?: boolean
}>()

const chartOptions = computed<ApexOptions>(() => ({
  labels: props.items.map((item) => item.label),
  plotOptions: {
    pie: {
      expandOnClick: false,
      customScale: 0.7,
      dataLabels: {
        offset: 84,
      },
    },
  },
  colors: props.items.map((_, index) =>
    Color(tailwind.theme.colors.main)
      .lighten(index * 0.1)
      .hex(),
  ),
  dataLabels: {
    dropShadow: {
      enabled: false,
    },
    style: {
      fontSize: '26px',
      fontWeight: '500',
      fontFamily: tailwind.theme.fontFamily.Sarala[0],
      colors: [tailwind.theme.colors.black],
    },
    formatter: (
      percentage,
      {
        seriesIndex,
        w: {
          globals: { series, labels },
        },
      },
    ) => {
      const label = labels[seriesIndex]
      const value = props.showPercentages
        ? `${(+percentage).toFixed(0)} %`
        : series[seriesIndex]

      return [label, value]
    },
  },
  legend: {
    show: false,
  },
  tooltip: { enabled: false },
  states: {
    hover: {
      filter: {
        type: 'none',
      },
    },
  },
}))

const series = computed(() => props.items.map((item) => item.value))
</script>
