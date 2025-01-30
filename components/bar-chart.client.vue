<template>
  <div class="h-[340px] w-full">
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
  type TooltipComponentOption,
  DatasetComponent,
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components'

export type BarChartItem = {
  label: string
  description?: string
  value: number
}

type EChartsOption = ComposeOption<
  | DatasetComponentOption
  | VisualMapComponentOption
  | GridComponentOption
  | MarkPointComponentOption
  | TooltipComponentOption
  | BarSeriesOption
>

use([
  SVGRenderer,
  BarChart,
  DatasetComponent,
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
])

const props = withDefaults(
  defineProps<{
    items: BarChartItem[]
    height?: number
    min?: number
    max?: number
    scaleFactor?: number
    maxItems?: number
    unit?: string
  }>(),
  { scaleFactor: 1 },
)

const option = computed<EChartsOption>(() => ({
  color: tailwind.theme.colors.main,
  grid: {
    right: 0,
  },
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'none',
    },
    transitionDuration: 0,
    formatter: '{c}',
    textStyle: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      color: tailwind.theme.colors['accent-darker'],
      align: 'center',
    },
    shadowColor: 'transparent',
    borderColor: tailwind.theme.colors['accent'],
    borderRadius: 6,
    padding: [4, 6],
    backgroundColor: tailwind.theme.colors['accent-light'],
  },
  xAxis: {
    data: props.items.map(({ label }) => label),
    axisLabel: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      fontSize: 16,
      padding: [6, 0],
      color: tailwind.theme.colors['accent-darker'],
    },
    axisLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent'],
      },
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      color: tailwind.theme.colors['accent-darker'],
    },
    axisLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent-darker'],
      },
    },
    splitLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent'],
      },
    },
  },
  series: [
    {
      data: props.items.map(({ value }) => value),
      type: 'bar',
      itemStyle: {
        borderRadius: 6,
      },
    },
  ],
}))
</script>
