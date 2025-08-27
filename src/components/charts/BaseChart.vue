<template>
    <div v-if="!loading" ref="chartRef" :style="{ width: width, height: height }"></div>
    <div v-else class="d-flex flex-row justify-center mt-10">
        <v-progress-circular
            color="primary"
            indeterminate
            size="128" 
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type PropType, nextTick } from "vue";
import * as echarts from "echarts";
import { type EChartsOption } from "echarts";


const props = defineProps({
    options: {
        type: Object as PropType<EChartsOption>,
        required: true
    },
    width: {
        type: String,
        default: "100%"
    },
    height: {
        type: String,
        default: "400px"
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

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

onMounted(async () => {
    initialise();
});

const initialise = async () => {
    if (chartRef.value) {
        chart = echarts.init(chartRef.value, props.theme, props.initOptions);
        chart.setOption(props.options);
        
        const resizeChart = () => chart?.resize();
        window.addEventListener("resize", resizeChart);

        await nextTick();
        chart.resize();
        
        onUnmounted(() => {
            window.removeEventListener("resize", resizeChart);
            chart?.dispose();
        });
    }
};

watch(chartRef, () => {
    initialise();
});

watch(() => props.options, (newOptions) => {
    if (chart) {
        chart.setOption(newOptions);
      }
}, { deep: true });
</script>
