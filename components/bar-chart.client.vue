<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <VChart renderer="svg" :option="option" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
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
    unit?: string
  }>(),
  { height: 340 },
)

const tooManyItems = computed(() => props.items.length > 15)

const interval = computed(() => {
  if (props.items.length <= 15) return 0
  if (props.items.length <= 30) return 1
  if (props.items.length <= 45) return 2
  if (props.items.length <= 60) return 3
  if (props.items.length <= 100) return 4
  return 5
})

const option = computed<EChartsOption>(() => ({
  color: tailwind.theme.colors.main,
  grid: {
    left: tooManyItems.value ? 100 : 30,
    right: 0,
    bottom: tooManyItems.value ? 100 : 60,
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
    data: props.items.map(({ label }) => label),
    axisLabel: {
      fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
      fontSize: 16,
      padding: [6, 0],
      color: tailwind.theme.colors['accent-darker'],
      interval: interval.value,
      rotate: tooManyItems.value ? 30 : 0,
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
      tooltip: {
        formatter: `<b>{b}</b><br />{c} ${props.unit ?? ''}`,
        color: tailwind.theme.colors.black,
      },
      itemStyle: {
        borderRadius: 6,
      },
    },
  ],
}))
</script>
