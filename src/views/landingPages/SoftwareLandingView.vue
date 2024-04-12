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
                        <software-update-modal :preset-software="software" :read-only="!canEdit" @update="updateBasicInfo"></software-update-modal>

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
                                    {{ software.doi }}
                                </div>
                                <div v-if="software?.uris && software?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <div v-for="uri in software?.uris" :key="uri">
                                        <v-btn
                                            variant="plain" style="opacity: 0.9;" class="no-uppercase m-0 p-0 h-auto" :href="uri"
                                            target="_blank">
                                            {{ uri }}
                                        </v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="software?.keywords ? software.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Description -->
        <description-section :description="software?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

        <person-document-contribution-list :contribution-list="software?.contributions ? software?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-list>

        <v-row>
            <h2>{{ $t("proofsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="software?.proofs ? software.proofs : []" :can-edit="canEdit" is-proof @create="addAttachment($event, true, software)"
                    @delete="deleteAttachment($event, true, software)" @update="updateAttachment($event, true, software)"></attachment-list>
            </v-col>
        </v-row>
        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="software?.fileItems ? software.fileItems : []" :can-edit="canEdit" @create="addAttachment($event, false, software)" @delete="deleteAttachment($event, false, software)"
                    @update="updateAttachment($event, false, software)"></attachment-list>
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
import type { DocumentPublicationIndex, PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { Software } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import SoftwareUpdateModal from '@/components/publication/update/SoftwareUpdateModal.vue';


export default defineComponent({
    name: "SoftwareLandingPage",
    components: { AttachmentList, PersonDocumentContributionList, DescriptionSection, LocalizedLink, KeywordList, SoftwareUpdateModal },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const software = ref<Software>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const canEdit = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-desktop-classic")

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchSoftware();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchSoftware = () => {
            DocumentPublicationService.readSoftware(parseInt(currentRoute.params.id as string)).then((response) => {
                software.value = response.data;

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
            software, icon,
            publications, publisher,
            totalPublications,
            returnCurrentLocaleContent,
            languageTagMap,
            searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo
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
