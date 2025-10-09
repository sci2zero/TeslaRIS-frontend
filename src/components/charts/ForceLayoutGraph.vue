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
                categories: {name: string, value: number}[];
            } | undefined>,
        required: true
    },
    categoryResolver: {
        type: Function,
        default: () => ({})
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

const emit = defineEmits(["listPublications"]);


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

const options = computed<EChartsOption>(() => {
    if (!props.data) return {};

    const graphSeries: GraphSeriesOption = {
        type: "graph",
        layout: "force",
        data: props.data.nodes.map(node => ({
            id: node.id,
            name: node.name.split("; ")[0],
            otherNames: node.name.split(";").slice(1),
            value: node.value,
            symbolSize: Math.max(5, Math.min(50, node.symbolSize)), // node size by degree
            draggable: true,
            category: props.categoryResolver(node.category)
        })),
        links: props.data.links.map(link => ({
            source: link.source,
            target: link.target,
            value: link.value,
            lineStyle: {
                width: Math.min(10, Math.max(1, link.value)) // edge thickness by strength
            }
        })),
        label: { show: true, position: "right" },
        emphasis: { focus: "adjacency" },
        force: {
            repulsion: 200,
            gravity: 0.001,
            edgeLength: 300
        },
        categories: props.data.categories.map(cat => ({
            name: cat.name,
            itemStyle: {
                color: getCategoryColor(cat.value)
            }
        })),
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
                    return `${i18n.t("fullNameLabel")}: ${params.data.name}${params.data.otherNames.length > 0 ? ("<br/>" + i18n.t("differentNamesLabel") + ": " + params.data.otherNames) : ""}<br/>${i18n.t("adjacencyDegreeLabel")}: ${params.data.value}<br/>${i18n.t("depthLabel")}: ${params.data.category}`;
                } else if (params.dataType === "edge") {
                    return `${i18n.t("collaborationLabel")}: ${getCollaborationName(params.data)}<br/>${i18n.t("worksInCommonLabel")}: ${params.data.value}`;
                }
                
                return params.name;
            }
        },
        legend: {
            data: props.data.categories.map(cat => cat).sort((a, b) => a.value - b.value).map(cat => ({
                name: cat.name,
                itemStyle: {
                    color: getCategoryColor(cat.value)
                }
            })),
            selectedMode: true,
            textStyle: {
                fontSize: 12
            },
            top: 'bottom',
            left: 'center'
        },
        series: [{
            ...graphSeries,
            roam: true,
            scaleLimit: {
                min: 0.1,
                max: 1
            }
        }]
    };
});

const getAuthorName = (authorId: string): string => {
    return props.data?.nodes.find(node => node.id === authorId)?.name.split(";")[0] ?? "";
};

const getCollaborationName = (data: CollaborationLink) => {
    return `${getAuthorName(data.source)} ↔ ${getAuthorName(data.target)}`;
};

const onChartReady = (chart: ECharts) => {
    chartInstance.value = chart;
    chart.on("click", (params: any) => {
        if (params.dataType === "node") {
            router.push(
                { 
                    name: "researcherLandingPage",
                    params: {id: params.data.id},
                    query: {displayCollaborationNetwork: "true"}
                }
            );
        } else if (params.dataType === "edge") {
            emit("listPublications", params.data, getCollaborationName(params.data))
        }
    });
};

const getCategoryColor = (value: number) => {
    switch(value) {
        case 0:
            return "orange";
        case 1:
            return "green";
        case 2:
            return "blue";
    }

    return "blue";
};

</script>
