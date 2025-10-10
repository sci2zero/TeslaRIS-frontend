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
import { computed, onMounted, ref, watch, type PropType } from "vue";
import BaseChart from "./BaseChart.vue";
import type { EChartsOption } from "echarts";
import { useI18n } from "vue-i18n";


export interface PieDataItem {
    name: string;
    value: number;
    color?: string;
}

const props = defineProps({
    data: {
        type: Array as PropType<PieDataItem[]>,
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
    donut: {
        type: Boolean,
        default: false
    },
    showPercentage: {
        type: Boolean,
        default: true
    }
});

const loading = ref(true);

onMounted(() => {
    shouldBeLoading();
});

watch(() => props.data, () => {
    shouldBeLoading();
});

const shouldBeLoading = () => {
    if(props.data && props.data.length > 0) {
        loading.value = false;
    }
};

const i18n = useI18n();
const totalValue = computed(() => {
    return props.data.reduce((sum, item) => sum + item.value, 0);
});

const options = computed(() => {
    if (!props.data || props.data.length === 0) {
        return {};
    }

    const filteredData = props.data.filter(item => item.value > 0);
    
    const seriesData = filteredData.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
            color: item.color
        }
    }));

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
            trigger: "item",
            formatter: (params: any) => {
                const percentage = ((params.value / totalValue.value) * 100).toFixed(1);
                return `
                    <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
                    <div style="display: flex; align-items: center; margin: 3px 0;">
                        <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; margin-right: 5px; border-radius: 2px;"></span>
                        <span style="flex: 1;">${i18n.t("countLabel")}:</span>
                        <span style="font-weight: bold; margin-left: 10px;">${params.value.toLocaleString()} (${percentage}%)</span>
                    </div>
                    <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee;">
                        ${i18n.t("fromTotalLabel")}: ${totalValue.value.toLocaleString()}
                    </div>
                `;
            }
        },
        legend: props.showLegend ? {
            type: "scroll",
            orient: "vertical",
            right: 10,
            top: "middle",
            data: filteredData.map(item => item.name) // Use filtered data for legend
        } : undefined,
        series: [{
            name: props.title,
            type: "pie",
            radius: props.donut ? ["40%", "70%"] : "70%",
            center: props.showLegend ? ["40%", "50%"] : ["50%", "50%"],
            data: seriesData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                }
            },
            label: {
                formatter: props.showPercentage ? 
                    "{b}: {c} ({d}%)" : 
                    "{b}: {c}"
            },
            labelLine: {
                length: 15,
                length2: 10
            },
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDelay: function (idx: number) {
                return idx * 100;
            }
        }]
    };
});
</script>
