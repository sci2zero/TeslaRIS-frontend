<template>
    <v-container id="dataset">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(dataset?.title) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(dataset?.subTitle) }}
                        <br />
                        {{ $t("datasetLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Dataset Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-dataset-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="DatasetUpdateForm"
                            :form-props="{ presetDataset: dataset }"
                            entity-name="Dataset"
                            is-update
                            is-section-update
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="dataset?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="dataset?.internalNumber" class="response">
                                    {{ dataset.internalNumber }}
                                </div>
                                <div v-if="dataset?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="dataset?.documentDate" class="response">
                                    {{ dataset.documentDate }}
                                </div>
                                <div v-if="dataset?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="dataset?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + dataset?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="dataset?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="dataset?.scopusId" class="response">
                                    {{ dataset.scopusId }}
                                </div>
                                <div v-if="dataset?.doi">
                                    DOI:
                                </div>
                                <div v-if="dataset?.doi" class="response">
                                    <identifier-link :identifier="dataset.doi"></identifier-link>
                                </div>
                                <div v-if="dataset?.uris && dataset?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="dataset?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <person-document-contribution-tabs :document-id="dataset?.id" :contribution-list="dataset?.contributions ? dataset?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>

        <!-- Keywords -->
        <keyword-list :keywords="dataset?.keywords ? dataset.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Description -->
        <description-section :description="dataset?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

        <attachment-section
            :document="dataset" :can-edit="canEdit" :proofs="dataset?.proofs" :file-items="dataset?.fileItems"
            in-comparator></attachment-section>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Dataset } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DatasetUpdateForm from '@/components/publication/update/DatasetUpdateForm.vue';


export default defineComponent({
    name: "DatasetLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const currentRoute = useRoute();
        const router = useRouter();

        const dataset = ref<Dataset>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const canEdit = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-database")

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchDataset();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchDataset = () => {
            DocumentPublicationService.readDataset(parseInt(currentRoute.params.id as string)).then((response) => {
                dataset.value = response.data;

                document.title = returnCurrentLocaleContent(dataset.value.title) as string;

                dataset.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(dataset.value.publisherId) {
                    PublisherService.readPublisher(dataset.value.publisherId).then((publisherResponse) => {
                        publisher.value = publisherResponse.data;
                    })
                }
    
                populateData();
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});        
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            dataset.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            dataset.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            dataset.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Dataset) => {
            dataset.value!.title = basicInfo.title;
            dataset.value!.subTitle = basicInfo.subTitle;
            dataset.value!.documentDate = basicInfo.documentDate;
            dataset.value!.doi = basicInfo.doi;
            dataset.value!.scopusId = basicInfo.scopusId;
            dataset.value!.uris = basicInfo.uris;
            dataset.value!.publisherId = basicInfo.publisherId;
            dataset.value!.internalNumber = basicInfo.internalNumber;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateDataset(dataset.value?.id as number, dataset.value as Dataset).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchDataset();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchDataset();
                }
            });
        };

        return {
            dataset, icon, publisher,
            returnCurrentLocaleContent,
            languageTagMap, searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, DatasetUpdateForm
        };
}})

</script>

<style scoped>
    #dataset .large-dataset-icon {
        font-size: 10em;
    }

    #dataset .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
