<template>
    <v-container id="patent">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(patent?.title) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(patent?.subTitle) }}
                        <br />
                        {{ $t("patentLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Patent Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-patent-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PatentUpdateForm"
                            :form-props="{ presetPatent: patent }"
                            entity-name="Patent"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="patent?.number">
                                    {{ $t("patentNumberLabel") }}:
                                </div>
                                <div v-if="patent?.number" class="response">
                                    {{ patent.number }}
                                </div>
                                <div v-if="patent?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="patent?.documentDate" class="response">
                                    {{ patent.documentDate }}
                                </div>
                                <div v-if="patent?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="patent?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + patent?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="patent?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="patent?.scopusId" class="response">
                                    {{ patent.scopusId }}
                                </div>
                                <div v-if="patent?.doi">
                                    DOI:
                                </div>
                                <div v-if="patent?.doi" class="response">
                                    <identifier-link :identifier="patent.doi"></identifier-link>
                                </div>
                                <div v-if="patent?.uris && patent?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="patent?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <person-document-contribution-tabs :document-id="patent?.id" :contribution-list="patent?.contributions ? patent?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>

        <!-- Keywords -->
        <keyword-list :keywords="patent?.keywords ? patent.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Description -->
        <description-section :description="patent?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

        <attachment-section
            :document="patent" :can-edit="canEdit" :proofs="patent?.proofs" :file-items="patent?.fileItems"
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
import type { Patent } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import PatentUpdateForm from '@/components/publication/update/PatentUpdateForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';


export default defineComponent({
    name: "PatentLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, UriList, IdentifierLink, GenericCrudModal },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const patent = ref<Patent>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const canEdit = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-seal-variant")

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchPatent();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchPatent = () => {
            DocumentPublicationService.readPatent(parseInt(currentRoute.params.id as string)).then((response) => {
                patent.value = response.data;

                document.title = returnCurrentLocaleContent(patent.value.title) as string;

                patent.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(patent.value.publisherId) {
                    PublisherService.readPublisher(patent.value.publisherId).then((publisherResponse) => {
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
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            patent.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            patent.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            patent.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Patent) => {
            patent.value!.title = basicInfo.title;
            patent.value!.subTitle = basicInfo.subTitle;
            patent.value!.documentDate = basicInfo.documentDate;
            patent.value!.doi = basicInfo.doi;
            patent.value!.scopusId = basicInfo.scopusId;
            patent.value!.uris = basicInfo.uris;
            patent.value!.publisherId = basicInfo.publisherId;
            patent.value!.number = basicInfo.number;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updatePatent(patent.value?.id as number, patent.value as Patent).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchPatent();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchPatent();
                }
            });
        };

        return {
            patent, icon, publisher,
            returnCurrentLocaleContent, PatentUpdateForm,
            languageTagMap, searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo
        };
}})

</script>

<style scoped>
    #patent .large-patent-icon {
        font-size: 10em;
    }

    #patent .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

</style>
