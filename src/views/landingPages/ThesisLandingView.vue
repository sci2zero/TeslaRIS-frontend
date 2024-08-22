<template>
    <v-container id="thesis">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(thesis?.title) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(thesis?.subTitle) }}
                        <br />
                        {{ $t("thesisLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Thesis Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-thesis-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <thesis-update-modal :preset-thesis="thesis" :read-only="!canEdit" @update="updateBasicInfo"></thesis-update-modal>

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="thesis?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="thesis?.documentDate" class="response">
                                    {{ localiseDate(thesis.documentDate) }}
                                </div>
                                <div v-if="thesis?.organisationUnitId">
                                    {{ $t("organisationUnitLabel") }}:
                                </div>
                                <div v-if="thesis?.organisationUnitId" class="response">
                                    <localized-link :to="'organisation-units/' + thesis?.organisationUnitId">
                                        {{ returnCurrentLocaleContent(organisationUnit?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="thesis?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="thesis?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + thesis?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="thesis?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="thesis?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + thesis?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="thesis?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfPages" class="response">
                                    {{ thesis.numberOfPages }}
                                </div>
                                <div v-if="thesis?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="thesis?.scopusId" class="response">
                                    {{ thesis.scopusId }}
                                </div>
                                <div v-if="thesis?.doi">
                                    DOI:
                                </div>
                                <div v-if="thesis?.doi" class="response">
                                    <doi-link :doi="thesis.doi"></doi-link>
                                </div>
                                <div v-if="thesis?.uris && thesis?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div v-if="thesis?.uris && thesis?.uris.length > 0" class="response">
                                    <uri-list :uris="thesis?.uris"></uri-list>
                                </div>
                                <div v-if="thesis?.languageTagIds && thesis?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div v-if="thesis?.languageTagIds && thesis?.languageTagIds.length > 0">
                                    <v-chip v-for="(languageTagId, index) in thesis?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="thesis?.keywords ? thesis.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Description -->
        <description-section :description="thesis?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

        <!-- Research Area -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy :research-areas="researchAreaHierarchy ? [researchAreaHierarchy] : []"></research-area-hierarchy>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Contributions -->
        <person-document-contribution-tabs :document-id="thesis?.id" :contribution-list="thesis?.contributions ? thesis?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>

        <v-row>
            <h2>{{ $t("proofsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="thesis?.proofs ? thesis.proofs : []" :can-edit="canEdit" is-proof @create="addAttachment($event, true, thesis)"
                    @delete="deleteAttachment($event, true, thesis)" @update="updateAttachment($event, true, thesis)"></attachment-list>
            </v-col>
        </v-row>
        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="thesis?.fileItems ? thesis.fileItems : []" :can-edit="canEdit" @create="addAttachment($event, false, thesis)" @delete="deleteAttachment($event, false, thesis)"
                    @update="updateAttachment($event, false, thesis)"></attachment-list>
            </v-col>
        </v-row>

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
import type { Thesis } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import ThesisUpdateModal from '@/components/publication/update/ThesisUpdateModal.vue';
import UriList from '@/components/core/UriList.vue';
import DoiLink from '@/components/core/DoiLink.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitResponse, ResearchArea } from '@/models/OrganisationUnitModel';
import { localiseDate } from '@/i18n/dateLocalisation';
import ResearchAreaService from '@/services/ResearchAreaService';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';


export default defineComponent({
    name: "ThesisLandingPage",
    components: { AttachmentList, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, UriList, DoiLink, ThesisUpdateModal, ResearchAreaHierarchy },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const thesis = ref<Thesis>();
        const publisher = ref<Publisher>();
        const organisationUnit = ref<OrganisationUnitResponse>();
        const event = ref<Conference>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const canEdit = ref(false);

        const i18n = useI18n();

        const researchAreaHierarchy = ref<ResearchArea>();

        const icon = ref("mdi-certificate-outline")

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchThesis();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchThesis = () => {
            DocumentPublicationService.readThesis(parseInt(currentRoute.params.id as string)).then((response) => {
                thesis.value = response.data;

                document.title = returnCurrentLocaleContent(thesis.value.title) as string;

                thesis.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                OrganisationUnitService.readOU(thesis.value.organisationUnitId).then((response) => {
                    organisationUnit.value = response.data;
                });

                if(thesis.value.publisherId) {
                    PublisherService.readPublisher(thesis.value.publisherId).then((publisherResponse) => {
                        publisher.value = publisherResponse.data;
                    });
                }

                if(thesis.value.eventId) {
                    EventService.readConference(thesis.value.eventId).then((response) => {
                        event.value = response.data;
                    });
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

            if (thesis.value?.researchAreaId) {
                ResearchAreaService.readResearchAreaHierarchy(thesis.value?.researchAreaId).then(response => {
                    researchAreaHierarchy.value = response.data;
                });
            }  
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            thesis.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            thesis.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            thesis.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Thesis) => {
            thesis.value!.title = basicInfo.title;
            thesis.value!.subTitle = basicInfo.subTitle;
            thesis.value!.documentDate = basicInfo.documentDate;
            thesis.value!.doi = basicInfo.doi;
            thesis.value!.scopusId = basicInfo.scopusId;
            thesis.value!.uris = basicInfo.uris;
            thesis.value!.publisherId = basicInfo.publisherId;
            thesis.value!.organisationUnitId = basicInfo.organisationUnitId;
            thesis.value!.numberOfPages = basicInfo.numberOfPages;
            thesis.value!.languageTagIds = basicInfo.languageTagIds;
            thesis.value!.researchAreaId = basicInfo.researchAreaId;
            thesis.value!.eventId = basicInfo.eventId;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateThesis(thesis.value?.id as number, thesis.value as Thesis).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchThesis();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchThesis();
                }
            });
        };

        return {
            thesis, icon, publisher,
            returnCurrentLocaleContent,
            languageTagMap, searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription, localiseDate,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, organisationUnit,
            researchAreaHierarchy, event
        };
}})

</script>

<style scoped>
    #thesis .large-thesis-icon {
        font-size: 10em;
    }

    #thesis .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
