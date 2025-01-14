<template>
    <generic-crud-modal
        class="mt-5 ml-5"
        :form-component="EntityClassificationForm"
        :form-props="{ applicableTypes: applicableTypes, entityId: entityId, entityType: containingEntityType }"
        entity-name="EntityClassification"
        :read-only="!canEdit"
        @create="createClassification"
    />
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
                                <generic-crud-modal
                                    :form-component="EntityClassificationForm"
                                    :form-props="{ presetClassification: classification, applicableTypes: classification.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                                    entity-name=""
                                    is-update
                                    :read-only="!canEdit"
                                    @update="updateClassification($event, classification.id)"
                                />
                            </div>
                            <div class="ml-5">
                                <v-btn v-if="canEdit" density="compact" @click.prevent="deleteCLassification(classification.id)">
                                    {{ $t("deleteLabel") }}
                                </v-btn>
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
import EntityClassificationForm from './EntityClassificationForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { GenericCrudModal },
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
        },
        containingEntityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, {emit}) {
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
            let displayTitle = `${i18n.t("entityClassificationsLabel")} `;
        
            if (entityClassification.categoryIdentifier) {
                displayTitle += `${i18n.t("inLabel")} ${entityClassification.categoryIdentifier} `;
            }

            displayTitle += `- ${entityClassification.year} (${returnCurrentLocaleContent(entityClassification.commissionDescription)})`;

            return displayTitle;
        };

        const updateClassification = async (entityIndicator: any, entityIndicatorId: number) => {
            if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityClassificationService.updateEventClassification(entityIndicator, entityIndicatorId);
            }

            emit("update");
        };

        const deleteCLassification = async (entityClassificationId: number) => {
            openedPanel.value = null;
            await EntityClassificationService.deleteEntityClassification(entityClassificationId);
            const index = props.entityClassifications.findIndex(classification => classification.id === entityClassificationId);
            titles.value.splice(index, 1);
            contents.value.splice(index, 1);

            emit("update");
        };

        const createClassification = (entityClassification: any) => {
            emit("create", entityClassification);
        };

        return {
            titles, contents,
            ApplicableEntityType,
            openedPanel,
            EntityClassificationForm,
            updateClassification,
            deleteCLassification,
            createClassification
        };
    }
});
</script>
