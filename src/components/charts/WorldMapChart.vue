<template>
    <BaseChart
        v-if="mapRegistered && props.data && props.data.length > 0"
        :options="(options as EChartsOption)"
        :width="width"
        :height="height"
        :theme="theme"
        :init-options="initOptions"
        :loading="loading"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, type PropType, ref, watch } from "vue";
import BaseChart from "./BaseChart.vue";
import type { EChartsOption } from "echarts";
import { useI18n } from "vue-i18n";
import world from 'echarts-map/json/world.json?json';
import { countriesEn, countriesSr, countryCodes } from "@/i18n/countries";
import { transliterateValueToCyrillic } from "@/utils/StringUtil";


export interface CountryStatisticsData {
    countryCode: string; // ISO 3166-1 alpha-2 code (e.g., 'US', 'GB')
    countryName: string;
    value: number;
}

const props = defineProps({
    data: {
        type: Array as PropType<CountryStatisticsData[]>,
        required: true
    },
    title: {
        type: String,
        default: "Title"
    },
    seriesName: {
        type: String,
        default: "Value"
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
    minValueColor: {
        type: String,
        default: "#C6EBF9"
    },
    maxValueColor: {
        type: String,
        default: "#2A70B1"
    },
    emptyColor: {
        type: String,
        default: "#EEEEEE"
    }
});

const i18n = useI18n();
const mapRegistered = ref(false);

const loading = ref(true);

watch(() => props.data, () => {
    shouldBeLoading();
});

const shouldBeLoading = () => {
    if(props.data && props.data.length > 0) {
        loading.value = false;
    }
};

onMounted(async () => {
    if (typeof window !== 'undefined' && !mapRegistered.value) {
        const echarts = await import('echarts');
        try {
            echarts.registerMap('world', world);
            mapRegistered.value = true;
        } catch (_ignored) {
            console.error('World map already registered or error loading map data.');
        }
    }

    shouldBeLoading();
});

const buildNameMap = () => {
    const locale = i18n.locale.value;
    const nameMap: Record<string, string> = {};

    countriesEn.forEach((enName, index) => {
        if (locale.startsWith("sr")) {
            nameMap[enName] = locale.endsWith("cyr") ? transliterateValueToCyrillic(countriesSr[index]) : countriesSr[index];
        } else {
            nameMap[enName] = enName;
        }
    });

    if (locale.startsWith("sr")) {
        nameMap["Kosovo"] = locale.endsWith("cyr") ? "Србија" : "Srbija";
        nameMap["Northern Cyprus"] = locale.endsWith("cyr") ? "Кипар" : "Kipar";
        nameMap["Somaliland"] = locale.endsWith("cyr") ? "Сомалија" : "Somalija";
    } else if (locale === "en") {
        nameMap["Kosovo"] = "Serbia";
        nameMap["Somaliland"] = "Somalija";
    }

    return nameMap;
};

const getLocalizedCountryName = (code: string) => {
    const index = countryCodes.indexOf(code);
    const locale = i18n.locale.value;

    if (locale.startsWith("sr")) {
        return locale.endsWith("cyr") ? transliterateValueToCyrillic(countriesSr[index]) : countriesSr[index];
    }

    return countriesEn[index];
};

const options = computed(() => {
    if (props.data.length === 0) {
        return {};
    }

    const mapData = props.data.map(item => ({
        name:   getLocalizedCountryName(item.countryCode),
        value: item.value
    }));

    const values = props.data.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

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
                return `
                    <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
                    <div>${props.seriesName}: ${params.value ? params.value.toLocaleString() : 0}</div>
                `;
            }
        },
        visualMap: {
            type: "continuous",
            min: minValue,
            max: maxValue,
            text: [i18n.t("highLabel"), i18n.t("lowLabel")],
            realtime: false,
            calculable: true,
            inRange: {
                color: [props.minValueColor, props.maxValueColor]
            },
            textStyle: {
                color: "#000"
            }
        },
        series: [{
            name: props.seriesName,
            type: "map",
            map: "world",
            emphasis: {
                label: {
                    show: true
                }
            },
            data: mapData,
            nameMap: buildNameMap(),
            emptyColor: props.emptyColor,
            universalTransition: true,
            roam: true,
            scaleLimit: {
                min: 1,
                max: 10
            }
        }]
    };
});
</script>
