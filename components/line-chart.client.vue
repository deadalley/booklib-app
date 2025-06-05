<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <VChart :option="option" :autoresize="true" />
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
    xAxisLabelFormatter?: (value?: string) => string
    tooltipFormatter?: (value: { x: string; y?: number }) => string
  }>(),
  { height: 340 },
)

const xAxisData =
  props.xAxisRange ??
  uniq(props.items.flatMap((item) => item.values.map(({ x }) => x)))

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
    data: xAxisData,
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
      color: tailwind.theme.colors.black,
      formatter: (params) => {
        if (props.tooltipFormatter) {
          return props.tooltipFormatter({
            x: xAxisData[params.dataIndex],
            y: (params.value as number) ?? undefined,
          })
        }
        return `<b>${props.xAxisLabelFormatter?.(xAxisData[params.dataIndex]) ?? xAxisData[params.dataIndex]}</b><br />${params.value} ${props.unit ?? ''}`
      },
    },
    itemStyle: {
      borderRadius: 6,
    },
  })),
}))
</script>
