<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <VChart renderer="svg" :option="option" />
  </div>
</template>

<script setup lang="ts" generic="T extends OptionDataValueNumeric">
import VChart from 'vue-echarts'
import { SVGRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import type { ComposeOption } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import type { PieSeriesOption } from 'echarts/charts'
import { TitleComponent } from 'echarts/components'
import type { TitleComponentOption } from 'echarts/components'
import type { OptionDataValueNumeric } from 'echarts/types/src/util/types.js'
import Color from 'color'

export type PieChartItem<P> = {
  label: string
  description?: string
  value: P
}

type EChartsOption = ComposeOption<TitleComponentOption | PieSeriesOption>

use([SVGRenderer, PieChart, TitleComponent])

const props = defineProps<{
  items: PieChartItem<T>[]
  height?: number
  unit?: string
}>()

const option = computed<EChartsOption>(() => ({
  color: props.items.map((_, index) =>
    Color(tailwind.colors.primary.DEFAULT)
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
        formatter: `{label|{b} ${props.unit ?? ''}} {value|{c}}`,
        rich: {
          label: {
            fontFamily: tailwind.fontFamily.display[0],
            fontWeight: 500,
            fontSize: 18,
            color: tailwind.colors.ink.secondary,
            verticalAlign: 'middle',
            padding: [0, 6, 0, 0],
          },
          value: {
            fontFamily: tailwind.fontFamily.display[0],
            fontWeight: 500,
            fontSize: 16,
            color: tailwind.colors.ink.inverse,
            backgroundColor: tailwind.colors.primary.DEFAULT,
            verticalAlign: 'middle',
            padding: [4, 6],
            borderRadius: 4,
          },
        },
        color: tailwind.colors.ink.primary,
      },
      labelLine: {
        lineStyle: {
          color: tailwind.colors.ink.primary,
        },
        smooth: 0.1,
      },
    },
  ],
}))
</script>
