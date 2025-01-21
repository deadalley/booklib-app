<template>
  <div class="flex flex-col gap-4">
    <apexchart
      type="rangeBar"
      :height="height ?? _items.length * 64"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

export type RankingItem = {
  label: string
  description?: string
  value: number
}

const props = withDefaults(
  defineProps<{
    items: RankingItem[]
    height?: number
    min?: number
    max?: number
    scaleFactor?: number
    maxItems?: number
    unit?: string
  }>(),
  { scaleFactor: 1 },
)

const _items = computed(() => {
  const sortedItems = props.items
    .slice(0, props.maxItems)
    .sort(({ value: v1 }, { value: v2 }) => v2 - v1)

  return sortedItems
})

const maxValue = computed<number>(() =>
  Math.max(..._items.value.map(({ value }) => value)),
)

const chartWidthAdjust = computed<number>(() => {
  const magnitude = getMagnitude(maxValue.value / props.scaleFactor)
  return (
    props.max ??
    maxValue.value / props.scaleFactor + magnitude + (magnitude * 7) / 10
  )
})

const chartMin = computed<number>(() => {
  return props.min ?? 0
})

const series = computed(() => [
  {
    name: 'highlight',
    data: _items.value.slice(0, 1).map(({ label, value }) => ({
      x: label,
      y: [chartMin.value, value / props.scaleFactor],
    })),
    color: tailwind.theme.colors.main,
  },
  {
    name: 'data',
    data: _items.value.slice(1).map(({ label, value }) => ({
      x: label,
      y: [chartMin.value, value / props.scaleFactor],
    })),
    color: tailwind.theme.colors['accent-dark'],
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    zoom: {
      enabled: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    bar: {
      barHeight: '3px',
      horizontal: true,
      isDumbbell: true,
      dumbbellColors: [
        ['transparent', tailwind.theme.colors.main],
        ['transparent', tailwind.theme.colors['accent-dark']],
      ],
      dataLabels: {
        position: 'top',
        hideOverflowingLabels: false,
      },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    offsetX: 20,
    offsetY: -6,
    style: {
      fontSize: '20px',
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      colors: [
        tailwind.theme.colors.main,
        tailwind.theme.colors['accent-dark'],
      ],
    },
    formatter: (_, { dataPointIndex, seriesIndex, config: { series } }) => {
      const label = series[seriesIndex]?.data[dataPointIndex]?.x
      return label
    },
  },
  annotations: {
    points: [
      ..._items.value
        .slice(0, 1)
        .map(({ label, value }) => getValueAnnotation(label, value, 0)),
      ..._items.value
        .slice(1)
        .map(({ label, value }) => getValueAnnotation(label, value, 1)),
    ],
  },
  grid: {
    show: false,
  },
  states: {
    hover: {
      filter: {
        type: 'none',
      },
    },
  },
  xaxis: {
    min: chartMin.value,
    max: chartWidthAdjust.value,
  },

  tooltip: {
    enabled: false,
  },
}))

function getValueAnnotation(
  label: string,
  value: number,
  seriesIndex: number,
): PointAnnotations {
  return {
    y: label as unknown as number, // type does not correspond with expected value
    x: value,
    marker: { size: 0, strokeWidth: 0 },
    label: {
      borderColor: 'none',
      textAnchor: 'start',
      offsetX: 20,
      offsetY: seriesIndex === 0 ? 8 : 10,
      style: {
        background: 'none',
        color:
          seriesIndex === 0
            ? tailwind.theme.colors.black
            : tailwind.theme.colors['accent-dark'],
        fontSize: '18px',
        fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      },
      text: `${value} ${props.unit ?? ''}`,
    },
  }
}
</script>
