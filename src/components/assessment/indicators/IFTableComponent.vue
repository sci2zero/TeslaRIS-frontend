<template>
    <v-container v-if="jsonData?.length > 0">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center justify-space-between">
                <span>{{ $t("impactFactorTableLabel") }}</span>
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
                            <td><strong>{{ props.item.type }}</strong></td>
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
import { type IFCategoryData } from "@/models/AssessmentModel";
import { defineComponent, computed, ref, watch } from "vue";

export default defineComponent({
    name: "IFTableComponent",
    props: {
        jsonData: {
            type: Array<IFCategoryData>,
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

        watch([() => props.presetFromYear, () => props.presetToYear], () => {
            fromYear.value = props.presetFromYear;
            toYear.value = props.presetToYear;
        });

        watch([fromYear, toYear], () => {
            if (fromYear.value > 1999 && toYear.value > 1999) {
                console.log(fromYear.value, toYear.value)
                emit("yearsUpdated", fromYear.value, toYear.value);
            }
        });

        const years = computed<number[]>(() => {
        const allYears = new Set<number>();
        props.jsonData.forEach(category => {
                category.if2Values.forEach(({ a }) => allYears.add(a));
                category.if5Values.forEach(({ a }) => allYears.add(a));
            });
            return Array.from(allYears).sort();
        });

        const headers = computed(() => [
            { title: "Type", key: "type", align: "start" },
            ...years.value.map(year => ({
                title: year.toString(),
                key: year.toString(),
                align: "left"
            }))
        ]);

        const tableData = computed(() => {
            return props.jsonData.map(category => {
                const ifValues = [
                    {
                        type: "IF2",
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            category.if2Values.find(v => v.a === year)?.b || null;
                        return acc;
                        }, {})
                    },
                    {
                        type: "IF2 rank",
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            category.if2Ranks.find(v => v.a === year)?.b || null;
                        return acc;
                        }, {})
                    },
                    {
                        type: "IF5",
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            category.if5Values.find(v => v.a === year)?.b || null;
                        return acc;
                        }, {})
                    },
                    {
                        type: "IF5 rank",
                        ...years.value.reduce<Record<number, string | null>>((acc, year) => {
                        acc[year] =
                            category.if5Ranks.find(v => v.a === year)?.b || null;
                        return acc;
                        }, {})
                    }
                ];
                return { category: category.category, ifValues };
            });
        });

        return {
            years, headers, tableData,
            fromYear, toYear
        };
    }
});
</script>
  