<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" />
  </div>
</template>

<script setup lang="ts">
import { SVGRenderer } from 'echarts/renderers'
import { type ComposeOption, use } from 'echarts/core'
import { type BarSeriesOption, BarChart } from 'echarts/charts'
import {
  type DatasetComponentOption,
  type VisualMapComponentOption,
  type GridComponentOption,
  type MarkPointComponentOption,
  DatasetComponent,
  GridComponent,
  MarkPointComponent,
} from 'echarts/components'

export type RankingItem = {
  label: string
  description?: string
  value: number
}

type EChartsOption = ComposeOption<
  | DatasetComponentOption
  | VisualMapComponentOption
  | GridComponentOption
  | MarkPointComponentOption
  | BarSeriesOption
>

use([
  SVGRenderer,
  BarChart,
  DatasetComponent,
  GridComponent,
  MarkPointComponent,
])

const props = withDefaults(
  defineProps<{
    items: RankingItem[]
    height?: number
    unit?: string | ((value: number) => string)
    withLabel?: boolean
  }>(),
  { height: 340 },
)

const _items = computed(() =>
  props.items
    .map((item) => ({
      ...item,
      value: item.value === 0 ? 0.1 : item.value,
    }))
    .reverse(),
)

const option = computed<EChartsOption>(() => ({
  color: tailwind.theme.colors['accent-dark'],
  grid: {
    left: 0,
    right: '70%',
    top: 0,
    bottom: 8,
  },
  xAxis: {
    show: false,
  },
  yAxis: {
    show: false,
    data: _items.value.map(({ label }) => label),
  },
  series: [
    {
      data: _items.value.map(({ value }, index) =>
        index === _items.value.length - 1
          ? {
              value,
              itemStyle: {
                color: tailwind.theme.colors.main,
              },
              label: {
                color: tailwind.theme.colors.main,
              },
            }
          : value,
      ),
      type: 'bar',
      barWidth: 2,
      label: {
        show: true,
        position: 'right',
        formatter: ({ value, name }) =>
          `{label|${name}}${props.withLabel ? `\n{value|${value === 0.1 ? 0 : value} ${renderUnit(value as number)}}` : ''}`,
        verticalAlign: 'top',
        offset: [10, -10],
        rich: {
          label: {
            fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
            fontWeight: 500,
            fontSize: 18,
            padding: [0, 0, 4, 0],
            align: 'left',
          },
          value: {
            fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
            fontWeight: 400,
            fontSize: 14,
            color: tailwind.theme.colors['accent-darker'],
            backgroundColor: tailwind.theme.colors['accent'],
            padding: [4, 6],
            borderRadius: 6,
            align: 'left',
          },
        },
      },
      markPoint: {
        symbol: 'circle',
        symbolSize: 12,
        data: _items.value.map(({ label, value }, index) => ({
          name: '',
          value,
          xAxis: value,
          yAxis: label,
          label: {
            show: false,
          },
          itemStyle: {
            color:
              index === _items.value.length - 1
                ? tailwind.theme.colors.main
                : tailwind.theme.colors['accent-dark'],
          },
        })),
      },
    },
  ],
}))

function renderUnit(value: number) {
  if (props.unit !== undefined) {
    if (typeof props.unit === 'function') {
      return props.unit(value)
    } else {
      return props.unit
    }
  }

  return ''
}
</script>
