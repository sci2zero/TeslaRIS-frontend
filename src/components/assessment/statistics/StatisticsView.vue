<template>
    <v-expansion-panels class="mt-3">
        <v-expansion-panel
            :title="title">
            <v-expansion-panel-text>
                <v-row v-for="(line, index) in content" :key="index" class="mt-4 mb-1">
                    {{ line }}
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, watch } from 'vue';
import { ref } from 'vue';
import type { EntityIndicatorResponse } from '@/models/AssessmentModel';
import StatisticsService from '@/services/StatisticsService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { localiseDate } from '@/i18n/dateLocalisation';


export default defineComponent({
    name: "ViewStatisticsComponent",
    props: {
        entityIndicators: {
            type: Array<EntityIndicatorResponse>,
            required: true
        },
        statisticsType: {
            type: Object as PropType<string>,
            required: true
        }
    },
    setup(props) {
        const statisticsIndicators = ref<string[]>([]);
        const statisticsEntityIndicators = ref<EntityIndicatorResponse[]>([]);

        const title = ref<string>("");
        const content = ref<string[]>([]);

        const i18n = useI18n();
        
        onMounted(() => {
            setIndicators();
        });

        watch(() => props.entityIndicators, () => {
            setIndicators();
        });

        watch(i18n.locale, () => {
            buildDisplayData();
        });

        const setIndicators = () => {
            if(props.entityIndicators) {
                StatisticsService.fetchStatisticsTypeIndicators(props.statisticsType).then((response) => {
                    statisticsIndicators.value = response.data;
                    if (!statisticsIndicators.value.includes(getIndicatorForTotalCount())) {
                        statisticsIndicators.value.push(getIndicatorForTotalCount());
                    }

                    props.entityIndicators.forEach(entityIndicator => {
                        if (statisticsIndicators.value.includes(entityIndicator.indicatorResponse.code)) {
                            statisticsEntityIndicators.value.push(entityIndicator);
                        }
                    });
                    buildDisplayData();
                });
            }
        };

        const buildDisplayData = () => {
            content.value.splice(0);
            statisticsEntityIndicators.value.sort((a, b) => -a.fromDate!.localeCompare(b.fromDate as string));
            statisticsEntityIndicators.value.forEach(statisticsEntityIndicator => {
                if (statisticsEntityIndicator.indicatorResponse.code === getIndicatorForTotalCount()) {
                    title.value = `${returnCurrentLocaleContent(statisticsEntityIndicator.indicatorResponse.title)}: ${statisticsEntityIndicator.numericValue}`;
                } else {
                    content.value.push(`${returnCurrentLocaleContent(statisticsEntityIndicator.indicatorResponse.title)}: ${statisticsEntityIndicator.numericValue} (${localiseDate(statisticsEntityIndicator.fromDate)} - ${localiseDate(statisticsEntityIndicator.toDate)}) - ${returnCurrentLocaleContent(statisticsEntityIndicator.indicatorResponse.description)}`);
                }
            });
        };

        const getIndicatorForTotalCount = () => {
            switch(props.statisticsType) {
                case "VIEW":
                    return "viewsTotal";
                case "DOWNLOAD":
                    return "downloadsTotal";
            }

            return "viewsTotal";
        };

        return {
            title, content,
            statisticsEntityIndicators
        };
    }
});
</script>
