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
import type { EChartsOption, ECharts, GraphSeriesOption } from "echarts";
import type { CollaborationLink, PersonNode } from "@/models/Common";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";


const props = defineProps({
    data: {
        type: Object as PropType<{
                nodes: PersonNode[];
                links: CollaborationLink[];
            } | undefined>,
        required: true
    },
    width: {
        type: String,
        default: "100%"
    },
    height: {
        type: String,
        default: "600px"
    },
    theme: {
        type: String,
        default: "default"
    },
    initOptions: {
        type: Object,
        default: () => ({})
    }
});

const loading = ref(true);
const chartInstance = ref<ECharts | null>(null);
const router = useRouter();

onMounted(() => {
    shouldBeLoading();
});

watch(() => props.data, () => {
    shouldBeLoading();
});

const shouldBeLoading = () => {
    if (props.data) {
        loading.value = false;
    }
};

const i18n = useI18n();


const categories = [
    {
        name: "0"
    },
    {
        name: "1"
    },
    {
        name: "2"
    },
    {
        name: "3"
    }
];

const options = computed<EChartsOption>(() => {
    if (!props.data) return {};

    const graphSeries: GraphSeriesOption = {
        type: "graph",
        layout: "force",
        data: props.data.nodes.map(node => ({
            id: node.id,
            name: node.name,
            value: node.value,
            symbolSize: Math.min(50, node.symbolSize), // node size by degree
            draggable: true,
            category: `${node.category}`
        })),
        links: props.data.links.map(link => ({
            source: link.source,
            target: link.target,
            value: link.value,
            lineStyle: {
                width: Math.max(1, link.value) // edge thickness by strength
            }
        })),
        label: { show: true, position: "right" },
        emphasis: { focus: "adjacency" },
        force: {
            repulsion: 100,
            gravity: 0.001,
            edgeLength: 300
        },
        categories: categories
  };

  return {
        title: {
            text: i18n.t("researcherCollaborationNetworkLabel"),
            top: "bottom",
            left: "right"
        },
        tooltip: {
            formatter: (params: any) => {
                if (params.dataType === "node") {
                    return `${i18n.t("fullNameLabel")}: ${params.data.name}<br/>${i18n.t("adjacencyDegreeLabel")}: ${params.data.value}<br/>${i18n.t("depthLabel")}: ${params.data.category}`;
                } else if (params.dataType === "edge") {
                    return `${i18n.t("collaborationLabel")}: ${getAuthorName(params.data.source)} ↔ ${getAuthorName(params.data.target)}<br/>${i18n.t("worksInCommonLabel")}: ${params.data.value}`;
                }
                    return params.name;
            }
        },
        legend: {
            data: categories.map(cat => cat.name),
            selectedMode: true,
            textStyle: {
                fontSize: 12
            },
            top: 'bottom',
            left: 'center'
        },
        series: [graphSeries]
    };
});

const getAuthorName = (authorId: string): string => {
    return props.data?.nodes.find(node => node.id === authorId)?.name ?? "";
};

const onChartReady = (chart: ECharts) => {
    chartInstance.value = chart;
    chart.on("click", (params: any) => {
        if (params.dataType === "node") {
            router.push({ name: "researcherLandingPage", params: {id: params.data.id} });
        } else if (params.dataType === "edge") {
            console.log("edge", params)
        }
    });
};
</script>
