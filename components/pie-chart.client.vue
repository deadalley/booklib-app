<template>
  <div class="h-[300px] w-full">
    <VChart :option="option" />
  </div>
</template>

<script setup lang="ts" generic="T extends OptionDataValueNumeric[]">
import { SVGRenderer } from 'echarts/renderers'
import { type ComposeOption, use } from 'echarts/core'
import { type PieSeriesOption, PieChart } from 'echarts/charts'
import {
  type TitleComponentOption,
  type TooltipComponentOption,
  type LegendComponentOption,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'

import Color from 'color'
import type { OptionDataValueNumeric } from 'echarts/types/src/util/types.js'

export type PieChartItem<P> = {
  label: string
  description?: string
  value: P
}

type EChartsOption = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | PieSeriesOption
>

use([SVGRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  items: PieChartItem<T>[]
  height?: number
  showPercentages?: boolean
}>()

const option = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
  },
  color: props.items.map((_, index) =>
    Color(tailwind.theme.colors.main)
      .lighten(index * 0.1)
      .hex(),
  ),
  series: [
    {
      data: props.items.map(({ label, value }) => ({ value, name: label })),
      name: 'data',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      padAngle: 3,
      itemStyle: {
        borderRadius: 6,
      },
      label: {
        formatter: '{label|{b}} {value|{c}}',
        rich: {
          label: {
            fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
            fontWeight: 500,
            fontSize: 18,
            color: '#4C5058',
            verticalAlign: 'middle',
            lineHeight: 33,
            padding: [0, 6, 0, 0],
          },
          value: {
            fontFamily: tailwind.theme.fontFamily.ReemKufi[0],
            fontWeight: 500,
            fontSize: 16,
            color: tailwind.theme.colors.white,
            backgroundColor: tailwind.theme.colors.main,
            verticalAlign: 'middle',
            padding: [3, 4],
            borderRadius: 4,
            lineHeight: 33,
          },
        },
        color: tailwind.theme.colors.black,
      },
      labelLine: {
        lineStyle: {
          color: tailwind.theme.colors.black,
        },
        smooth: 0.1,
      },
    },
  ],
}))
</script>
