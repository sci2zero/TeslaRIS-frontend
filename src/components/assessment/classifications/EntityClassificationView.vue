<template>
    <generic-crud-modal
        class="mt-5"
        :form-component="EntityClassificationForm"
        :form-props="{ applicableTypes: applicableTypes, entityId: entityId, entityType: containingEntityType }"
        :entity-name="containingEntityType === ApplicableEntityType.DOCUMENT ? 'EntityAssessment' : 'EntityClassification'"
        :read-only="!canEdit"
        @create="createClassification"
    />
    <v-row>
        <v-col>
            <h2 class="mt-5">
                {{ (containingEntityType != ApplicableEntityType.DOCUMENT) ? $t("classificationsLabel") : $t("assessmentsLabel") }}
            </h2>
        
            <v-expansion-panels v-if="entityClassifications?.length > 0" v-model="openedPanel" class="mt-3 mb-1 ml1 mr-1">
                <v-expansion-panel
                    v-for="(classification, index) in entityClassifications"
                    :key="classification.id" :title="titles[index] + (classification.manual ? ` (${$t('manualLabel')})` : '')">
                    <v-expansion-panel-text>
                        <v-row class="mt-4 mb-1">
                            <p>{{ contents[index] }}</p>
                        </v-row>
                        <v-row v-if="classification.manual">
                            <div v-if="classification.commissionId === loggedInUser?.commissionId || userRole === 'ADMIN'">
                                <generic-crud-modal
                                    :form-component="EntityClassificationForm"
                                    :form-props="{ presetClassification: classification, applicableTypes: classification.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                                    entity-name=""
                                    is-update
                                    :read-only="!canEdit"
                                    @update="updateClassification($event, classification.id)"
                                />
                            </div>
                            <div v-if="canEdit && (classification.commissionId === loggedInUser?.commissionId || userRole === 'ADMIN')" class="ml-5">
                                <v-btn density="compact" @click.prevent="deleteCLassification(classification.id)">
                                    {{ $t("deleteLabel") }}
                                </v-btn>
                            </div>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
            <h3 v-else>
                {{ $t("noClassificationsLabel") }}
            </h3>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, type PropType, watch } from 'vue';
import { ref } from 'vue';
import type { EntityClassificationResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { ApplicableEntityType } from '@/models/Common';
import EntityClassificationForm from './EntityClassificationForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import UserService from '@/services/UserService';
import type { UserResponse } from '@/models/UserModel';


export default defineComponent({
    name: "ViewClassificationsComponent",
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

        const loggedInUser = ref<UserResponse>();
        const userRole = computed(() => UserService.provideUserRole());
        
        onMounted(() => {
            setClassifications();
            UserService.getLoggedInUser().then(response => {
                loggedInUser.value = response.data;
            });
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
            let displayValue = returnCurrentLocaleContent(entityClassification.classificationTitle);

            if (entityClassification.assessmentReason.length > 0) {
                displayValue += " " + returnCurrentLocaleContent(entityClassification.assessmentReason);
            }

            const title = buildDisplayTitle(entityClassification);

            titles.value.push(title);
            
            contents.value.push(`${displayValue}`);
        };

        const buildDisplayTitle = (entityClassification: EntityClassificationResponse) => {
            let displayTitle = `${(props.containingEntityType !== ApplicableEntityType.DOCUMENT) ? i18n.t("classificationLabel") : i18n.t("assessmentLabel")} `;
        
            if (entityClassification.categoryIdentifier) {
                displayTitle += `${i18n.t("inLabel")} ${entityClassification.categoryIdentifier} `;
            }

            if (entityClassification.year) {
                displayTitle += `- ${entityClassification.year} (${returnCurrentLocaleContent(entityClassification.commissionDescription)})`;
            } else {
                displayTitle += `- ${returnCurrentLocaleContent(entityClassification.commissionDescription)}`;
            }

            return displayTitle;
        };

        const updateClassification = async (entityClassification: any, entityClassificationId: number) => {
            if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityClassificationService.updateEventClassification(entityClassification, entityClassificationId);
            } else if (props.containingEntityType === ApplicableEntityType.PUBLICATION_SERIES) {
                await EntityClassificationService.updatePublicationSeriesClassification(entityClassification, entityClassificationId);
            } else if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityClassificationService.updateDocumentClassification(entityClassification, entityClassificationId);
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
            openedPanel, userRole,
            EntityClassificationForm,
            updateClassification,
            deleteCLassification,
            createClassification,
            loggedInUser
        };
    }
});
</script>
