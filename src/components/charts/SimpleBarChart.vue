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


export interface BarSeries {
    name: string;
    data: number[];
    color?: string;
}

const props = defineProps({
    data: {
        type: Object as PropType<{
            categories: string[];
            series: BarSeries[];
        } | undefined>,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    subtitle: {
        type: String,
        default: ""
    },
    width: {
        type: String,
        default: "100%"
    },
    height: {
        type: String,
        default: "500px"
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
    },
    showLegend: {
        type: Boolean,
        default: true
    },
    horizontal: {
        type: Boolean,
        default: false
    },
    yLabel: {
        type: String,
        default: "Value"
    }
});

const options = computed(() => {
    if (!props.data) {
        return {};
    }

    const isHorizontal = props.horizontal;
    
    const series = props.data.series.map((series, index) => ({
        name: series.name,
        type: "bar",
        data: series.data,
        itemStyle: {
            color: series.color
        },
        emphasis: {
            focus: "series"
        },
        label: {
            show: false,
            position: isHorizontal ? "right" : "top",
            formatter: ({ value }: any) => value.toLocaleString()
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: "elasticOut",
        animationDelay: index * 100
    }));

    return {
        title: {
            text: props.title,
            subtext: props.subtitle,
            textStyle: {
                fontSize: 18,
                fontWeight: "bold"
            }
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow"
            },
            formatter: (params: any) => {
                const category = params[0].name;
                let html = `<div style="font-weight: bold; margin-bottom: 5px;">${category}</div>`;
                
                params.forEach((param: any) => {
                    const value = param.value;
                    const seriesName = param.seriesName;
                    const color = param.color;
                    
                    html += `
                        <div style="display: flex; align-items: center; margin: 3px 0;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px; border-radius: 2px;"></span>
                        <span style="flex: 1;">${seriesName}:</span>
                        <span style="font-weight: bold; margin-left: 10px;">${value.toLocaleString()}</span>
                        </div>
                    `;
                });
                
                return html;
            }
        },
        legend: props.showLegend ? {
            data: props.data.series.map(s => s.name),
            bottom: 0,
            type: "scroll"
        } : undefined,
        grid: {
            left: "3%",
            right: "4%",
            bottom: props.showLegend ? "60px" : "3%",
            top: props.subtitle ? "60px" : "50px",
            containLabel: true
        },
        xAxis: {
            type: isHorizontal ? "value" : "category",
            data: isHorizontal ? undefined : props.data.categories,
            name: isHorizontal ? "Value" : undefined,
            axisLabel: {
                rotate: isHorizontal ? 0 : props.data.categories.some(cat => cat.length > 10) ? 45 : 0
            }
        },
        yAxis: {
            type: isHorizontal ? "category" : "value",
            data: isHorizontal ? props.data.categories : undefined,
            name: isHorizontal ? undefined : props.yLabel,
            axisLabel: {
                rotate: isHorizontal ? 0 : undefined
            },
            ...(!isHorizontal && {
                interval: 1,
                minInterval: 1,
                axisTick: {
                    interval: 1
                }
            })
        },
        series: series
    };
});
</script>
