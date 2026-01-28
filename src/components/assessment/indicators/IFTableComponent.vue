<template>
    <v-container v-if="jsonData?.ifTableContent.length > 0">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center justify-space-between">
                <span>{{ $t("impactFactorTableLabel") }}</span>
                <span class="ml-2 mr-1">(</span>
                <span class="mr-1">{{ $t(jsonData.editions.length > 1 ? "editionsLabel" : "editionLabel") }}:</span>
                <span v-for="(edition, index) in jsonData.editions.filter(ed => ed)" :key="edition">
                    {{ edition }}{{ (index < jsonData.editions.length - 1) ? "," : "" }}
                </span>
                <span class="ml-1">)</span>
                <v-spacer></v-spacer>

                <v-row no-gutters class="align-center" style="max-width: 250px;">
                    <v-col cols="5">
                        <v-text-field
                            v-model="fromYear"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details
                            :label="$t('fromLabel')"
                            class="mr-2"
                            min="1999"
                            :max="(new Date()).getFullYear() + 2"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="5">
                        <v-text-field
                            v-model="toYear"
                            type="number"
                            density="compact"
                            variant="outlined"
                            hide-details
                            :label="$t('toLabel')"
                            min="1999"
                            :max="(new Date()).getFullYear() + 2"
                        ></v-text-field>
                    </v-col>
                </v-row>
            </v-card-title>

            <v-card-text>
                <v-data-table
                    v-if="ifValuesTable.length"
                    :headers="headers"
                    :items="ifValuesTable"
                    density="comfortable"
                    hide-default-footer
                    class="mb-5"
                >
                    <template #top>
                        <v-toolbar flat>
                            <v-toolbar-title>{{ $t("ifValuesLabel") }}</v-toolbar-title>
                        </v-toolbar>
                    </template>

                    <template #item="props">
                        <tr>
                            <td><strong>{{ props.item.type.value }}</strong></td>
                            <td v-for="year in years" :key="year">
                                {{ (props as any).item[year] || '-' }}
                            </td>
                        </tr>
                    </template>
                </v-data-table>

                <v-data-table
                    v-for="categoryData in tableData"
                    :key="categoryData.category"
                    :headers="headers"
                    :items="categoryData.ifValues"
                    class="mb-5"
                    density="comfortable"
                    hide-default-footer
                >
                    <template #top>
                        <v-toolbar flat>
                            <v-toolbar-title>{{ categoryData.category }}</v-toolbar-title>
                        </v-toolbar>
                    </template>
  
                    <template #item="props">
                        <tr>
                            <td><strong>{{ props.item.type.value }}</strong></td>
                            <td v-for="year in years" :key="year">
                                {{ (props as any).item[year] || '-' }}
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>
  
<script lang="ts">
import { type IFTableResponse } from "@/models/AssessmentModel";
import { defineComponent, computed, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "IFTableComponent",
    props: {
        jsonData: {
            type: Object as PropType<IFTableResponse>,
            required: true
        },
        presetFromYear: {
            type: Number,
            required: true
        },
        presetToYear: {
            type: Number,
            required: true
        }
    },
    emits: ["yearsUpdated"],
    setup(props, {emit}) {
        const fromYear = ref(props.presetFromYear);
        const toYear = ref(props.presetToYear);

        const i18n = useI18n();
        const typeLabel = computed(() => i18n.t("typeLabel"));
        const if2ValueLabel = computed(() => i18n.t("if2ValueLabel"));
        const if5ValueLabel = computed(() => i18n.t("if5ValueLabel"));
        const jciValueLabel = computed(() => i18n.t("jciValueLabel"));
        const jciPercentileLabel = computed(() => i18n.t("jciPercentileLabel"));
        const if2RankLabel = computed(() => i18n.t("if2RankLabel"));
        const if5RankLabel = computed(() => i18n.t("if5RankLabel"));
        const jciRankLabel = computed(() => i18n.t("jciRankLabel"));

        watch([() => props.presetFromYear, () => props.presetToYear], () => {
            fromYear.value = props.presetFromYear;
            toYear.value = props.presetToYear;
        });

        watch([fromYear, toYear], () => {
            if (fromYear.value > 1999 && toYear.value > 1999) {
                emit("yearsUpdated", fromYear.value, toYear.value);
            }
        });

        const years = computed<number[]>(() => {
            const allYears = new Set<number>();
            props.jsonData.if2Values.forEach(({ a }) => allYears.add(a));
            props.jsonData.if5Values.forEach(({ a }) => allYears.add(a));
            props.jsonData.ifTableContent.forEach(category => {
                category.if2Ranks.forEach(({ a }) => allYears.add(a));
                category.if5Ranks.forEach(({ a }) => allYears.add(a));
            });

            return Array.from(allYears).sort();
        });

        const headers = computed((): any => [
            { title: typeLabel, key: "type", align: "start" },
            ...years.value.map(year => ({
                title: year.toString(),
                key: year.toString(),
                align: "left"
            }))
        ]);

        const ifValuesTable = computed(() => {
            return [
                {
                    type: if2ValueLabel,
                    ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            props.jsonData.if2Values.find(v => v.a === year)?.b || null;
                        return acc;
                    }, {})
                },
                {
                    type: if5ValueLabel,
                    ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            props.jsonData.if5Values.find(v => v.a === year)?.b || null;
                        return acc;
                    }, {})
                },
                {
                    type: jciValueLabel,
                    ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            props.jsonData.jciValues.find(v => v.a === year)?.b || null;
                        return acc;
                    }, {})
                },
                {
                    type: jciPercentileLabel,
                    ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            props.jsonData.jciPercentiles.find(v => v.a === year)?.b || null;
                        return acc;
                    }, {})
                }
            ];
        });

        const tableData = computed(() => {
            return props.jsonData.ifTableContent.map(category => {
                const ifValues = [
                    {
                        type: if2RankLabel,
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                            acc[year] =
                                category.if2Ranks.find(v => v.a === year)?.b || null;
                            return acc;
                        }, {})
                    },
                    {
                        type: if5RankLabel,
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                            acc[year] =
                                category.if5Ranks.find(v => v.a === year)?.b || null;
                            return acc;
                        }, {})
                    },
                    {
                        type: jciRankLabel,
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                            acc[year] =
                                category.jciRanks.find(v => v.a === year)?.b || null;
                            return acc;
                        }, {})
                    }
                ];
                return { category: category.category, ifValues };
            });
        });

        return {
            years, headers,
            tableData, ifValuesTable,
            fromYear, toYear
        };
    }
});
</script>
