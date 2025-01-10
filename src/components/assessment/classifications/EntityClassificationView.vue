<template>
    <v-row>
        <v-col>
            <h2 v-if="entityClassifications?.length > 0" class="mt-5">
                {{ $t("entityClassificationsLabel") }}
            </h2>
        
            <v-expansion-panels v-model="openedPanel" class="mt-3 mb-1 ml1 mr-1">
                <v-expansion-panel
                    v-for="(classification, index) in entityClassifications"
                    :key="classification.id" :title="titles[index]">
                    <v-expansion-panel-text>
                        <v-row class="mt-4 mb-1">
                            <p>{{ contents[index] }}</p>
                        </v-row>
                        <v-row v-if="classification.manual">
                            <div>
                                <!-- <generic-crud-modal
                            :form-component="EntityIndicatorForm"
                            :form-props="{ presetDocumentIndicators: indicator, applicableTypes: indicator.indicatorResponse.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                            entity-name=""
                            is-update
                            :read-only="!canEdit"
                            @update="updateIndicator($event, indicator.id)"
                        /> -->
                            </div>
                            <div class="ml-5">
                                <!-- <v-btn v-if="canEdit" density="compact" @click.prevent="deleteIndicator(indicator.id)">
                            {{ $t("deleteLabel") }}
                        </v-btn> -->
                            </div>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, watch } from 'vue';
import { ref } from 'vue';
import type { EntityClassificationResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { ApplicableEntityType } from '@/models/Common';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    props: {
        entityClassifications: {
            type: Array<EntityClassificationResponse>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: false
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    emits: ["updated"],
    setup(props) {
        const titles = ref<string[]>([]);
        const contents = ref<string[]>([]);

        const openedPanel = ref();

        const i18n = useI18n();
        
        onMounted(() => {
            setClassifications();
        });

        watch(() => props.entityClassifications, () => {
            setClassifications();
        });

        watch(i18n.locale, () => {
            setClassifications();
        });

        const setClassifications = () => {
            titles.value.splice(0);
            contents.value.splice(0);

            if (props.entityClassifications) {
                props.entityClassifications.forEach(entityClassification => {
                    buildDisplayData(entityClassification);
                });
            }
        };

        const buildDisplayData = (entityClassification: EntityClassificationResponse) => {
            const displayValue = returnCurrentLocaleContent(entityClassification.classificationTitle);

            const title = buildDisplayTitle(entityClassification);

            titles.value.push(title);
            
            contents.value.push(`${displayValue}`);
        };

        const buildDisplayTitle = (entityClassification: EntityClassificationResponse) => {
            return `${i18n.t("entityClassificationsLabel")} ${i18n.t("inLabel")} ${entityClassification.categoryIdentifier} - ${entityClassification.year} (${returnCurrentLocaleContent(entityClassification.commissionDescription)})`;
        };

        // const updateIndicator = async (entityIndicator: any, entityIndicatorId: number) => {
        //     if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
        //         await EntityIndicatorService.updateDocumentIndicator(entityIndicator, entityIndicatorId);
        //     } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
        //         await EntityIndicatorService.updateEventIndicator(entityIndicator, entityIndicatorId);
        //     }

        //     emit("updated");
        // };

        // const deleteCLassification = async (entityIndicatorId: number) => {
        //     openedPanel.value = null;
        //     await EntityIndicatorService.deleteEntityIndicator(entityIndicatorId);
        //     const index = entityIndicatorsFiltered.findIndex(indicator => indicator.id === entityIndicatorId);
        //     entityIndicatorsFiltered.splice(index, 1);
        //     titles.value.splice(index, 1);
        //     contents.value.splice(index, 1);
        // };

        return {
            titles, contents,
            ApplicableEntityType,
            openedPanel
        };
    }
});
</script>
