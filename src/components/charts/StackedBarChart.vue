<template>
    <BaseChart
        :options="(options as EChartsOption)"
        :width="width"
        :height="height"
        :theme="theme"
        :init-options="initOptions"
        :loading="loading"
        @chart-ready="onChartReady"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type PropType } from "vue";
import BaseChart from "./BaseChart.vue";
import type { ECharts, EChartsOption } from "echarts";
import { useI18n } from "vue-i18n";
import { getPublicationTypeValueFromTitleAutoLocale } from "@/i18n/publicationType";
import { getThesisTypeValueFromTitleAutoLocale } from "@/i18n/thesisType";


export interface StackedBarSeries {
    name: string;
    data: number[];
    color?: string;
}

export interface TrendLineOptions {
    show?: boolean;
    name?: string;
    color?: string;
    smooth?: boolean;
    symbol?: string;
    symbolSize?: number;
    lineStyle?: {
        width?: number;
        type?: "solid" | "dashed" | "dotted";
    };
    itemStyle?: {
        borderColor?: string;
        borderWidth?: number;
    };
    customData?: number[];
}

const props = defineProps({
    data: {
        type: Object as PropType<{
            categories: string[];
            series: StackedBarSeries[];
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
    showLegend: {
        type: Boolean,
        default: true
    },
    showToolbox: {
        type: Boolean,
        default: false
    },
    horizontal: {
        type: Boolean,
        default: false
    },
    stackName: {
        type: String,
        default: "total"
    },
    trendLine: {
        type: Object as PropType<TrendLineOptions>,
        default: () => ({})
    },
    yLabel: {
        type: String,
        default: "Value"
    }
});

const i18n = useI18n();
const totalLabel = computed(() => i18n.t("totalLabel"));

const categoryTotals = computed(() => {
    return props.data?.categories.map((_, index) => {
        return props.data?.series.reduce((sum, series) => sum + series.data[index], 0);
    });
});

const emit = defineEmits(["listPublications"]);

const loading = ref(true);
const chartInstance = ref<ECharts | null>(null);

onMounted(() => {
    shouldBeLoading();
});

watch(() => props.data, () => {
    shouldBeLoading();
});

const shouldBeLoading = () => {
    if(props.data) {
        loading.value = false;
    }
};

const options = computed(() => {
    if (!props.data) {
        return {};
    }

    const isHorizontal = props.horizontal;
    const showTrendLine = props.trendLine.show !== false && categoryTotals.value && categoryTotals.value.length > 0;
  
    const series: any[] = [
        ...props.data.series.map((series, index) => ({
            name: series.name,
            type: "bar",
            stack: props.stackName,
            data: series.data.map((value, i) => ({
                value,
                total: categoryTotals.value![i]
            })),
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
        })),
        ...(showTrendLine ? [{
            name: props.trendLine.name || "Total Trend",
            type: "line",
            data: props.trendLine.customData || categoryTotals.value,
            smooth: props.trendLine.smooth !== false,
            symbol: props.trendLine.symbol || "circle",
            symbolSize: props.trendLine.symbolSize || 8,
            lineStyle: {
                color: props.trendLine.color || "blue",
                width: props.trendLine.lineStyle?.width || 3,
                type: props.trendLine.lineStyle?.type || "solid",
                ...props.trendLine.lineStyle
            },
            itemStyle: {
                color: props.trendLine.color || "blue",
                borderColor: props.trendLine.itemStyle?.borderColor || "#ffffff",
                borderWidth: props.trendLine.itemStyle?.borderWidth || 2,
                ...props.trendLine.itemStyle
            },
            zlevel: 1,
            animation: true,
            animationDuration: 1500,
            animationEasing: "cubicOut"
        }] : [])
    ];

    return {
        title: {
            text: props.title,
            subtext: props.subtitle,
            left: "center",
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
                    if(param.seriesType === "line") {
                        return;
                    }

                const color = param.color;
                const percent = ((value / param.data.total) * 100).toFixed(1);
                
                html += `
                    <div style="display: flex; align-items: center; margin: 3px 0;">
                    <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; margin-right: 5px; border-radius: 2px;"></span>
                    <span style="flex: 1;">${seriesName}:</span>
                    <span style="font-weight: bold; margin-left: 10px;">${value.toLocaleString()} ${(percent !== "NaN") ? "(" + percent + "%)" : ""}</span>
                    </div>
                `;
                });
                
                const total = params.filter((param: any) => param.seriesType === "bar").reduce((sum: number, param: any) => sum + param.value, 0);
                html += `
                <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee; font-weight: bold;">
                    ${totalLabel.value}: ${total}
                </div>
                `;
                
                return html;
            }
        },
        legend: props.showLegend ? {
            data: props.data.series.map(s => s.name),
            bottom: -4,
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
                interval: 50,
                minInterval: 1,
                axisTick: {
                    interval: 1
                }
            })
        },
        series: series,
        dataZoom: props.data.categories.length > 10 ? [
            {
                type: "inside",
                xAxisIndex: isHorizontal ? undefined : 0,
                yAxisIndex: isHorizontal ? 0 : undefined,
                start: 0,
                end: 100
            },
            {
                type: "slider",
                xAxisIndex: isHorizontal ? undefined : 0,
                yAxisIndex: isHorizontal ? 0 : undefined,
                start: 0,
                end: 100,
                height: 15
            }
        ] : undefined
    };
});

const onChartReady = (chart: ECharts) => {
    chartInstance.value = chart;
    chart.on("click", (params: any) => {
        const publicationType = getPublicationTypeValueFromTitleAutoLocale(params.seriesName);
        if (publicationType) {
            emit("listPublications", publicationType, parseInt(params.name), false);
        } else {
            const thesisType = getThesisTypeValueFromTitleAutoLocale(params.seriesName);
            if (thesisType) {
                emit("listPublications", thesisType, parseInt(params.name), true);
            }
        }
    });
};

</script>
