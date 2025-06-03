<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" />
  </div>
</template>

<script setup lang="ts">
import { SVGRenderer } from 'echarts/renderers'
import { type ComposeOption, use } from 'echarts/core'
import { type LineSeriesOption, LineChart } from 'echarts/charts'
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
import { uniq } from 'ramda'

export type LineChartItem = {
  label: string
  description?: string
  color?: string
  values: { x: string; y?: number }[]
}

type EChartsOption = ComposeOption<
  | DatasetComponentOption
  | VisualMapComponentOption
  | GridComponentOption
  | MarkPointComponentOption
  | TooltipComponentOption
  | LineSeriesOption
>

use([
  SVGRenderer,
  LineChart,
  DatasetComponent,
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
])

const props = withDefaults(
  defineProps<{
    items: LineChartItem[]
    height?: number
    unit?: string
    xAxisRange?: string[]
    xAxisLabelFormatter?: (value: string) => string
  }>(),
  { height: 340 },
)

const option = computed<EChartsOption>(() => ({
  grid: {
    top: 10,
    bottom: 10,
    left: 14,
    right: 54,
    containLabel: true,
  },
  tooltip: {
    trigger: 'item',
    axisPointer: {
      type: 'none',
    },
    transitionDuration: 0,
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
    data:
      props.xAxisRange ??
      uniq(props.items.flatMap((item) => item.values.map(({ x }) => x))),
    type: 'category',
    boundaryGap: false,
    axisLabel: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      fontSize: 14,
      color: tailwind.theme.colors['accent-darker'],
      formatter: props.xAxisLabelFormatter,
    },
    axisLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent'],
      },
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    axisLabel: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      fontSize: 14,
      color: tailwind.theme.colors['accent-darker'],
    },
    axisLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent'],
      },
    },
    splitLine: {
      lineStyle: {
        color: tailwind.theme.colors['accent'],
      },
    },
  },
  series: props.items.map((item) => ({
    data: item.values.map(({ y }) => y),
    type: 'line',
    name: item.label,
    color: item.color ?? tailwind.theme.colors.main,
    smooth: true,
    tooltip: {
      formatter: `<b>{b}</b><br />{c} ${props.unit ?? ''}`,
      color: tailwind.theme.colors.black,
    },
    itemStyle: {
      borderRadius: 6,
    },
  })),
}))
</script>
