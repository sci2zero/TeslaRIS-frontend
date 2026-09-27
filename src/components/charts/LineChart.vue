<template>
    <BaseChart
        :options="(options as EChartsOption)"
        :width="width"
        :height="height"
        :theme="theme"
        :init-options="initOptions"
        :loading="loading"
    />
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import BaseChart from "./BaseChart.vue";
import type { EChartsOption } from "echarts";

export interface LinePoint {
    label: string;
    value: number | null;
    annotation?: string;
}

const props = defineProps({
    points: {
        type: Array as PropType<LinePoint[]>,
        default: () => []
    },
    seriesName: {
        type: String,
        default: ""
    },
    yLabel: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: "#5b32d6"
    },
    max: {
        type: Number,
        default: 100
    },
    suffix: {
        type: String,
        default: "%"
    },
    width: {
        type: String,
        default: "100%"
    },
    height: {
        type: String,
        default: "320px"
    },
    theme: {
        type: String,
        default: "default"
    },
    initOptions: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const options = computed<EChartsOption>(() => ({
    grid: { left: 60, right: 24, top: 24, bottom: 40 },
    tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
            const point = Array.isArray(params) ? params[0] : params;
            const value = point.value === null || point.value === undefined
                ? "-" : `${point.value.toFixed(1)}${props.suffix}`;
            const annotation = props.points[point.dataIndex]?.annotation;

            return annotation
                ? `${point.name}<br/><b>${value}</b><br/>${annotation}`
                : `${point.name}<br/><b>${value}</b>`;
        }
    },
    xAxis: {
        type: "category",
        boundaryGap: false,
        data: props.points.map(point => point.label)
    },
    yAxis: {
        type: "value",
        min: 0,
        max: props.max,
        name: props.yLabel,
        nameLocation: "middle",
        nameGap: 42,
        axisLabel: { formatter: (value: number) => `${value}` }
    },
    series: [
        {
            name: props.seriesName,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            // Nulls stay null so a period nothing was assessed in becomes a gap in the line
            // rather than a plunge to zero.
            connectNulls: false,
            data: props.points.map(point => point.value),
            itemStyle: { color: props.color },
            lineStyle: { color: props.color, width: 2 }
        }
    ]
}));
</script>
