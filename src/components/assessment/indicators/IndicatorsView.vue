<template>
    <h2 v-if="entityIndicatorsFiltered?.length > 0">
        {{ $t("manualIndicatorsLabel") }}
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
                            :form-props="{ presetDocumentIndicator: indicator, applicableTypes: indicator.indicatorResponse.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
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
                    <div class="ml-5 mt-2">
                        <document-file-submission-modal v-if="canEdit" :is-proof="true" @create="addIndicatorProof($event, indicator.id)"></document-file-submission-modal>
                    </div>
                </v-row>
                <v-row>
                    <indicator-proofs-list :attachments="indicator.proofs" :can-edit="canEdit" @update="updateIndicatorProof($event, indicator.id)" @delete="deleteIndicatorProof($event, indicator.id)"></indicator-proofs-list>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
    <h2 v-if="contentMap?.size > 0">
        {{ $t("harvestedIndicatorsLabel") }}
    </h2>
    <v-expansion-panels class="mt-3">
        <v-expansion-panel
            v-for="(keyValue, index) in contentMap"
            :key="index" :title="keyValue[0]">
            <v-expansion-panel-text>
                <v-row v-for="(line, lineIndex) in keyValue[1]" :key="lineIndex" class="mt-4 mb-1">
                    <p>{{ line.value }}</p>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, reactive, watch } from 'vue';
import { ref } from 'vue';
import { EntityIndicatorSource, type PublicationSeriesIndicatorResponse, type EntityIndicatorResponse, IndicatorContentType } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import { localiseDate } from '@/i18n/dateLocalisation';
import EntityIndicatorForm from './EntityIndicatorForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { ApplicableEntityType } from '@/models/Common';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { getIndicatorSourceTitleFromValueAutoLocale } from '@/i18n/entityIndicatorSource';
import DocumentFileSubmissionModal from '@/components/documentFile/DocumentFileSubmissionModal.vue';
import type { DocumentFile } from '@/models/DocumentFileModel';
import IndicatorProofsList from './IndicatorProofsList.vue';


export default defineComponent({
    name: "ViewIndicatorsComponent",
    components: { GenericCrudModal, DocumentFileSubmissionModal, IndicatorProofsList },
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

        const contentMap = ref<Map<string, {value: string, fromDate: string}[]>>(new Map());

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
            contentMap.value.clear();

            if (props.entityIndicators) {
                props.entityIndicators.forEach(entityIndicator => {
                    for (const codePrefix of props.excludePrefixes) {
                        if (entityIndicator.indicatorResponse.code.startsWith(codePrefix)) {
                            return;   
                        }
                    }

                    if (entityIndicator.source === EntityIndicatorSource.MANUAL) {
                        entityIndicatorsFiltered.push(entityIndicator);
                        buildDisplayData(entityIndicator);
                    } else {
                        addToContentMap(entityIndicator);
                    }
                });

                contentMap.value.forEach((value) => {
                    value.sort((a, b) => {
                        if(!b.fromDate) {
                            return 1;
                        }

                        return b.fromDate.localeCompare(a.fromDate);
                    });
                });
            }
        };

        const addToContentMap = (entityIndicator: EntityIndicatorResponse) => {
            const key = buildDisplayTitle(entityIndicator);
            if (!contentMap.value.has(key)) {
                contentMap.value.set(key, [{value: returnCurrentLocaleContent(entityIndicator.indicatorResponse.description) as string, fromDate: ""}]);
            }
            contentMap.value.get(key)?.push({value: `${buildDisplayDate(entityIndicator)} - ${buildDisplayValue(entityIndicator)}`, fromDate: entityIndicator.fromDate as string});
        };

        const buildDisplayData = (entityIndicator: EntityIndicatorResponse) => {
            const displayValue = buildDisplayValue(entityIndicator);

            const title = buildDisplayTitle(entityIndicator);

            titles.value.push(title);

            const date = buildDisplayDate(entityIndicator);
            
            contents.value.push(`${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)}: ${displayValue} ${date} - ${returnCurrentLocaleContent(entityIndicator.indicatorResponse.description)}`);
        };

        const buildDisplayTitle = (entityIndicator: EntityIndicatorResponse) => {
            let title = `${returnCurrentLocaleContent(entityIndicator.indicatorResponse.title)} `;

            if (props.containingEntityType === ApplicableEntityType.PUBLICATION_SERIES && (entityIndicator as PublicationSeriesIndicatorResponse).categoryIdentifier) {
                title += ` ${i18n.t("inLabel")} ${(entityIndicator as PublicationSeriesIndicatorResponse).categoryIdentifier}`;
            }

            title += ` - ${getIndicatorSourceTitleFromValueAutoLocale(entityIndicator.source)}`;

            return title;
        };

        const buildDisplayDate = (entityIndicator: EntityIndicatorResponse) => {
            let date = "";
            if (entityIndicator.fromDate || entityIndicator.toDate) {
                date = `(${entityIndicator.fromDate ? localiseDate(entityIndicator.fromDate) : "*"} - ${entityIndicator.toDate ? localiseDate(entityIndicator.toDate) : i18n.t("currentLabel")}) `;
            }

            return date;
        };

        const buildDisplayValue = (entityIndicator: EntityIndicatorResponse) => {
            let displayValue = "";
            if (entityIndicator.textualValue || entityIndicator.indicatorResponse.contentType === IndicatorContentType.TEXT) {
                displayValue += (entityIndicator.textualValue ? entityIndicator.textualValue : "N/A");
            } else if ((entityIndicator.numericValue !== null && entityIndicator.numericValue !== undefined) || entityIndicator.indicatorResponse.contentType === IndicatorContentType.NUMBER) {
                displayValue += (entityIndicator.numericValue ? entityIndicator.numericValue : "N/A");
            } else {
                if (entityIndicator.booleanValue) {
                    displayValue += i18n.t("trueLabel");
                } else {
                    displayValue += i18n.t("falseLabel");
                }
            }

            return displayValue;
        };

        const updateIndicator = async (entityIndicator: any, entityIndicatorId: number) => {
            if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityIndicatorService.updateDocumentIndicator(entityIndicator.indicator, entityIndicatorId);
            } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityIndicatorService.updateEventIndicator(entityIndicator.indicator, entityIndicatorId);
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

        const addIndicatorProof = (documentFile: DocumentFile, entityIndicatorId: number) => {
            EntityIndicatorService.addEntityIndicatorProof(documentFile, entityIndicatorId, undefined).then(() => {
                emit("updated");
            });
        };

        const updateIndicatorProof = (documentFile: DocumentFile, entityIndicatorId: number) => {
            EntityIndicatorService.updateEntityIndicatorProof(documentFile, entityIndicatorId).then(() => {
                emit("updated");
            });
        };

        const deleteIndicatorProof = (proofId: number, entityIndicatorId: number) => {
            EntityIndicatorService.deleteEntityIndicatorProof(proofId, entityIndicatorId).then(() => {
                emit("updated");
            });
        };

        return {
            titles, contents,
            EntityIndicatorForm,
            entityIndicatorsFiltered,
            ApplicableEntityType,
            updateIndicator,
            EntityIndicatorSource,
            deleteIndicator,
            openedPanel, contentMap,
            addIndicatorProof,
            updateIndicatorProof,
            deleteIndicatorProof
        };
    }
});
</script>
