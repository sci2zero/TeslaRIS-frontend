<template>
    <v-container id="assessment-rulebook">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(assessmentRulebook?.name) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("assessmentRulebookLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Assessment Rulebook Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-assessment-rulebook-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="AssessmentRulebookForm"
                            :form-props="{ presetAssessmentRulebook: assessmentRulebook, isUpdate: true }"
                            is-section-update
                            entity-name="AssessmentRulebook"
                            :read-only="false"
                            @create="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="assessmentRulebook?.issueDate">
                                    {{ $t("issueDateLabel") }}:
                                </div>
                                <div v-if="assessmentRulebook?.issueDate" class="response">
                                    {{ localiseDate(assessmentRulebook.issueDate) }}
                                </div>
                                <div v-if="assessmentRulebook?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="assessmentRulebook?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + assessmentRulebook?.publisherId">
                                        {{ returnCurrentLocaleContent(assessmentRulebook?.publisherName) }}
                                    </localized-link>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Description -->
        <description-section :description="assessmentRulebook?.description" can-edit is-general-description @update="updateDescription"></description-section>

        <!-- Assessment Measures -->
        <br />
        <assessment-measure-table-component
            :assessment-measures="assessmentMeasures" :total-assessment-measures="totalAssessmentMeasures" @switch-page="switchPage" @create="addAssessmentMeasure"
            @update="updateAssessmentMeasure"></assessment-measure-table-component>

        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="assessmentRulebook?.pdfFile ? [assessmentRulebook.pdfFile] : []" can-edit @create="addAttachment" @update="updateAttachment"
                    @delete="deleteAttachment"></attachment-list>
            </v-col>
        </v-row>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent, Page } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import AttachmentList from '@/components/core/AttachmentList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { AssessmentMeasure, AssessmentRulebook, AssessmentRulebookResponse } from '@/models/AssessmentModel';
import AssessmentRulebookService from '@/services/assessment/AssessmentRulebookService';
import type { DocumentFile } from '@/models/DocumentFileModel';
import { localiseDate } from '@/i18n/dateLocalisation';
import DocumentFileService from '@/services/DocumentFileService';
import AssessmentRulebookForm from '@/components/assessment/assessmentRulebook/AssessmentRulebookForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import AssessmentMeasureTableComponent from '@/components/assessment/assessmentMeasure/AssessmentMeasureTableComponent.vue';
import type { AxiosResponse } from 'axios';
import AssessmentMeasureService from '@/services/assessment/AssessmentMeasureService';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "AssessmentRulebookLandingPage",
    components: { AttachmentList, DescriptionSection, LocalizedLink, GenericCrudModal, AssessmentMeasureTableComponent, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const assessmentRulebook = ref<AssessmentRulebookResponse>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const i18n = useI18n();

        const icon = ref("mdi-notebook-outline");

        const assessmentMeasures = ref<AssessmentMeasure[]>([]);
        const totalAssessmentMeasures = ref<number>(0);
        const assessmentsPage = ref(0);
        const assessmentsSize = ref(25);
        const assessmentsSort = ref("");
        const assessmentsDirection = ref("");

        onMounted(() => {
            fetchAssessmentRulebook();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchAssessmentRulebook = () => {
            AssessmentRulebookService.readAssessmentRulebook(parseInt(currentRoute.params.id as string)).then((response) => {
                assessmentRulebook.value = response.data;

                document.title = returnCurrentLocaleContent(assessmentRulebook.value.name) as string;
    
                populateData();
            });
        };

        const fetchMeasures = () => {
            AssessmentRulebookService.getAssessmentMeasuresForRulebook(parseInt(currentRoute.params.id as string), `page=${assessmentsPage.value}&size=${assessmentsSize.value}&sort=${assessmentsSort.value},${assessmentsDirection.value}`).then((response: AxiosResponse<Page<AssessmentMeasure>>) => {
                assessmentMeasures.value = response.data.content;
                totalAssessmentMeasures.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            assessmentsPage.value = nextPage;
            assessmentsSize.value = pageSize;
            assessmentsSort.value = sortField;
            assessmentsDirection.value = sortDir;
            fetchMeasures();
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const updateDescription = (description: MultilingualContent[]) => {
            assessmentRulebook.value!.description = description;
            performUpdate(false);
        };

        const updateBasicInfo = (basicInfo: AssessmentRulebook) => {
            assessmentRulebook.value!.name = basicInfo.name;
            assessmentRulebook.value!.issueDate = basicInfo.issueDate;
            assessmentRulebook.value!.publisherId = basicInfo.publisherId as number;

            performUpdate(true);
        };

        const addAttachment = (attachment: DocumentFile) => {
            AssessmentRulebookService.addAssessmentRulebookFileAttachment(assessmentRulebook.value!.id, attachment).then((response) => {
                assessmentRulebook.value!.pdfFile = response.data
            });
        };

        const deleteAttachment = (attachmentId: number) => {
            AssessmentRulebookService.deleteAssessmentRulebookFileAttachment(assessmentRulebook.value!.id, attachmentId).then(() => {
                assessmentRulebook.value!.pdfFile = undefined;
            });
        };

        const updateAttachment = (attachment: DocumentFile) => {
            DocumentFileService.updateDocumentFileAttachment(attachment).then((response) => {
                assessmentRulebook.value!.pdfFile = response.data
            });
        };

        const performUpdate = (reload: boolean) => {
            const updateRequest: AssessmentRulebook = {
                name: assessmentRulebook.value?.name as MultilingualContent[],
                description: assessmentRulebook.value?.description as MultilingualContent[],
                issueDate: assessmentRulebook.value?.issueDate as string,
                publisherId: assessmentRulebook.value?.publisherId
            }

            AssessmentRulebookService.updateAssessmentRulebook(assessmentRulebook.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchAssessmentRulebook();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchAssessmentRulebook();
                }
            });
        };

        const addAssessmentMeasure = (newAssessmentMeasure: AssessmentMeasure) => {
            newAssessmentMeasure.assessmentRulebookId = assessmentRulebook.value?.id as number;
            AssessmentMeasureService.createAssessmentMeasure(newAssessmentMeasure).then(response => {
                assessmentMeasures.value.push(response.data);
            });
        };

        const updateAssessmentMeasure = (assessmentMeasureId: number, assessmentMeasure: AssessmentMeasure) => {
            const index = assessmentMeasures.value.findIndex(measure => measure.id === assessmentMeasureId);
            assessmentMeasures.value[index] = assessmentMeasure;
        };

        return {
            assessmentRulebook, icon, returnCurrentLocaleContent,
            languageTagMap, updateBasicInfo, updateAttachment,
            addAttachment, deleteAttachment, localiseDate,
            updateDescription, snackbar, snackbarMessage,
            AssessmentRulebookForm, assessmentMeasures,
            totalAssessmentMeasures, switchPage,
            addAssessmentMeasure, updateAssessmentMeasure
        };
}})

</script>

<style scoped>
    #assessment-rulebook .large-assessment-rulebook-icon {
        font-size: 10em;
    }

    #assessment-rulebook .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
