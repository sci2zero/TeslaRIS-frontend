<template>
    <h2 v-if="entityIndicatorsFiltered?.length > 0">
        {{ $t("otherIndicatorsLabel") }}
    </h2>
    <v-expansion-panels v-model="openedPanel" class="mt-3">
        <v-expansion-panel
            v-for="(indicator, index) in entityIndicatorsFiltered"
            :key="indicator.id" :title="titles[index]">
            <v-expansion-panel-text>
                <v-row class="mt-4 mb-1">
                    <p>{{ contents[index] }}</p>
                </v-row>
                <v-row v-if="indicator.source === EntityIndicatorSource.MANUAL" class="align-left">
                    <div>
                        <generic-crud-modal
                            :form-component="EntityIndicatorForm"
                            :form-props="{ presetDocumentIndicators: indicator, applicableTypes: indicator.indicatorResponse.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                            entity-name=""
                            is-update
                            :read-only="!canEdit"
                            @update="updateIndicator($event, indicator.id)"
                        />
                    </div>
                    <div class="ml-5">
                        <v-btn v-if="canEdit" density="compact" @click.prevent="deleteIndicator(indicator.id)">
                            {{ $t("deleteLabel") }}
                        </v-btn>
                    </div>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, reactive, watch } from 'vue';
import { ref } from 'vue';
import { EntityIndicatorSource, type EntityIndicatorResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { localiseDate } from '@/i18n/dateLocalisation';
import EntityIndicatorForm from './EntityIndicatorForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { ApplicableEntityType } from '@/models/Common';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { GenericCrudModal },
    props: {
        entityIndicators: {
            type: Array<EntityIndicatorResponse>,
            required: true
        },
        excludePrefixes: {
            type: Array<string>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: false
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        containingEntityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["updated"],
    setup(props, { emit }) {
        const titles = ref<string[]>([]);
        const contents = ref<string[]>([]);
        const entityIndicatorsFiltered = reactive<EntityIndicatorResponse[]>([]);

        const openedPanel = ref();

        const i18n = useI18n();
        
        onMounted(() => {
            setIndicators();
        });

        watch(() => props.entityIndicators, () => {
            setIndicators();
        });

        watch(i18n.locale, () => {
            setIndicators();
        });

        const setIndicators = () => {
            entityIndicatorsFiltered.splice(0);
            titles.value.splice(0);
            contents.value.splice(0);

            if (props.entityIndicators) {
                props.entityIndicators.forEach(entityIndicator => {
                    for (const codePrefix of props.excludePrefixes) {
                        if (entityIndicator.indicatorResponse.code.startsWith(codePrefix)) {
                            return;   
                        }
                    }

                    entityIndicatorsFiltered.push(entityIndicator);
                    buildDisplayData(entityIndicator);
                });
            }
        };

        const buildDisplayData = (entityIndicator: EntityIndicatorResponse) => {
            let displayValue = "";
            if (entityIndicator.textualValue) {
                displayValue += entityIndicator.textualValue;
            } else if (entityIndicator.numericValue !== null && entityIndicator.numericValue !== undefined) {
                displayValue += entityIndicator.numericValue;
            } else {
                if (entityIndicator.booleanValue) {
                    displayValue += i18n.t("trueLabel");
                } else {
                    displayValue += i18n.t("falseLabel");
                }
            }

            titles.value.push(`${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)}: ${displayValue}`)
            contents.value.push(`${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)}: ${displayValue} (${localiseDate(entityIndicator.fromDate)} - ${localiseDate(entityIndicator.toDate)}) - ${returnCurrentLocaleContent(entityIndicator.indicatorResponse.description)}`);
        };

        const updateIndicator = async (entityIndicator: any, entityIndicatorId: number) => {
            if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityIndicatorService.updateDocumentIndicator(entityIndicator, entityIndicatorId);
            } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityIndicatorService.updateEventIndicator(entityIndicator, entityIndicatorId);
            }

            emit("updated");
        };

        const deleteIndicator = async (entityIndicatorId: number) => {
            openedPanel.value = null;
            await EntityIndicatorService.deleteEntityIndicator(entityIndicatorId);
            const index = entityIndicatorsFiltered.findIndex(indicator => indicator.id === entityIndicatorId);
            entityIndicatorsFiltered.splice(index, 1);
            titles.value.splice(index, 1);
            contents.value.splice(index, 1);
        };

        return {
            titles, contents,
            EntityIndicatorForm,
            entityIndicatorsFiltered,
            ApplicableEntityType,
            updateIndicator,
            EntityIndicatorSource,
            deleteIndicator,
            openedPanel
        };
    }
});
</script>
