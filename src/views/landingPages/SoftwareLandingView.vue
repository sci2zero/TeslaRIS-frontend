<template>
    <v-container id="software">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(software?.title) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(software?.subTitle) }}
                        <br />
                        {{ $t("softwareLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Software Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-software-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="SoftwareUpdateForm"
                            :form-props="{ presetSoftware: software }"
                            entity-name="Software"
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
                                <div v-if="software?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="software?.internalNumber" class="response">
                                    {{ software.internalNumber }}
                                </div>
                                <div v-if="software?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="software?.documentDate" class="response">
                                    {{ software.documentDate }}
                                </div>
                                <div v-if="software?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="software?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + software?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="software?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="software?.scopusId" class="response">
                                    {{ software.scopusId }}
                                </div>
                                <div v-if="software?.doi">
                                    DOI:
                                </div>
                                <div v-if="software?.doi" class="response">
                                    <identifier-link :identifier="software.doi"></identifier-link>
                                </div>
                                <div v-if="software?.uris && software?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="software?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="canEdit || (software?.contributions && software?.contributions.length > 0)" value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="documentIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list :keywords="software?.keywords ? software.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

                <!-- Description -->
                <description-section :description="software?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

                <attachment-section :document="software" :can-edit="canEdit" :proofs="software?.proofs" :file-items="software?.fileItems"></attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs :document-id="software?.id" :contribution-list="software?.contributions ? software?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <div class="w-50 statistics">
                    <statistics-view :entity-indicators="documentIndicators" :statistics-type="StatisticsType.VIEW"></statistics-view>
                    <statistics-view :entity-indicators="documentIndicators" :statistics-type="StatisticsType.DOWNLOAD"></statistics-view>
                </div>
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button v-if="canEdit && userRole === 'RESEARCHER'" :document-id="(software?.id as number)" @unbind="handleResearcherUnbind"></publication-unbind-button>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Software } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import SoftwareUpdateForm from '@/components/publication/update/SoftwareUpdateForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import UserService from '@/services/UserService';
import StatisticsService from '@/services/StatisticsService';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import StatisticsView from '@/components/assessment/statistics/StatisticsView.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "SoftwareLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, StatisticsView, PublicationUnbindButton, Toast },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const software = ref<Software>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const userRole = computed(() => UserService.provideUserRole());
        const canEdit = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-desktop-classic");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);

        onMounted(() => {
            fetchDisplayData();
        });

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const fetchDisplayData = () => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            }).catch(() => {
                canEdit.value = false;
            });

            fetchSoftware();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchSoftware = () => {
            DocumentPublicationService.readSoftware(parseInt(currentRoute.params.id as string)).then((response) => {
                software.value = response.data;

                document.title = returnCurrentLocaleContent(software.value.title) as string;

                software.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(software.value.publisherId) {
                    PublisherService.readPublisher(software.value.publisherId).then((publisherResponse) => {
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
            software.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            software.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            software.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Software) => {
            software.value!.title = basicInfo.title;
            software.value!.subTitle = basicInfo.subTitle;
            software.value!.documentDate = basicInfo.documentDate;
            software.value!.doi = basicInfo.doi;
            software.value!.scopusId = basicInfo.scopusId;
            software.value!.uris = basicInfo.uris;
            software.value!.publisherId = basicInfo.publisherId;
            software.value!.internalNumber = basicInfo.internalNumber;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateSoftware(software.value?.id as number, software.value as Software).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchSoftware();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchSoftware();
                }
            });
        };

        return {
            software, icon, publisher,
            returnCurrentLocaleContent, currentTab,
            languageTagMap, searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, SoftwareUpdateForm,
            handleResearcherUnbind, userRole,
            StatisticsType, documentIndicators
        };
}})

</script>

<style scoped>
    #software .large-software-icon {
        font-size: 10em;
    }

    #software .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
