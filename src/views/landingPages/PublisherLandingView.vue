<template>
    <v-container id="publisher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!publisher"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center">
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(publisher?.name) }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("publisherLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Publisher Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-publisher-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PublisherUpdateForm"
                            :form-props="{ presetPublisher: publisher }"
                            entity-name="Publisher"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!publisher" :citation-button="false" />
                        <v-row v-else>
                            <v-col cols="3">
                                <div v-if="publisher?.countryId">
                                    {{ $t("countryLabel") }}:
                                </div>
                                <div v-if="publisher?.countryName?.length ?? 0 > 0" class="response">
                                    {{ returnCurrentLocaleContent(publisher?.countryName) }}
                                </div>
                                <div v-if="publisher?.state && publisher?.state.length > 0">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="publisher?.state && publisher?.state.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(publisher?.state) }}
                                </div>
                            </v-col>
                            <v-col cols="3">
                                <div v-if="publisher?.place && publisher?.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="publisher?.place && publisher?.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(publisher?.place) }}
                                </div>
                            </v-col>
                            <v-col v-if="isAdmin" cols="3">
                                <data-quality-remarks-dialog
                                    :entity-type="EntityType.PUBLISHER"
                                    :entity-id="publisher?.id"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Publication Table -->
        <br />
        <tab-content-loader
            v-if="!publisher"
            :button-header="false"
            layout="table"
        />
        <publication-table-component
            v-else
            :publications="publications"
            :total-publications="totalPublications"
            @switch-page="switchPage"
        />
        
        <!-- Revision History -->
        <template v-if="(isAdmin || isViceDeanForScience) && publisher">
            <h2 class="mt-8 mb-2">
                {{ $t("revisionHistoryLabel") }}
            </h2>
            <revision-history-table-component
                :entity-type="EntityType.PUBLISHER"
                :entity-id="publisher?.id"
                @restored="fetchPublisher"
                @show-assessment-details="showAssessmentDetails"
            />

            <h2 class="mt-8 mb-2">
                {{ $t("dataQualityLabel") }}
            </h2>
            <data-quality-tabs-component
                ref="dataQualityTabsRef"
                :entity-type="EntityType.PUBLISHER"
                :entity-id="publisher?.id"
            />
        </template>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Publisher } from '@/models/PublisherModel';
import PublisherService from '@/services/PublisherService';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { getErrorMessageForErrorKey } from '@/i18n';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PublisherUpdateForm from '@/components/publisher/update/PublisherUpdateForm.vue';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityRemarksDialog from '@/components/core/revisions/DataQualityRemarksDialog.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "PublisherSeriesLandingPage",
    components: { PublicationTableComponent, GenericCrudModal, Toast, BasicInfoLoader, TabContentLoader, RevisionHistoryTableComponent, DataQualityRemarksDialog, DataQualityTabsComponent },
    setup() {
        const { isAdmin, isViceDeanForScience } = useUserRole();

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            dataQualityTabsRef.value?.selectVersion(version.majorVersion, version.minorVersion);
        };

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();

        const icon = ref("mdi-account-group");

        const canEdit = ref(false);

        const loginStore = useLoginStore();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                PublisherService.canEdit(
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canEdit.value = response.data;
                });
            }

            fetchPublisher();
        });

        const fetchPublisher = () => {
            PublisherService.readPublisher(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                publisher.value = response.data;

                document.title = returnCurrentLocaleContent(publisher.value.name) as string;

                fetchPublications();     
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!publisher.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsForPublisher(
                publisher.value?.id as number,
                `page=${page.value}&size=${size.value}&sort=${sort.value}`
            ).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            })
        };

        const updateBasicInfo = (updatedBasicInfo: Publisher) => {
            publisher.value!.name = updatedBasicInfo.name;
            publisher.value!.place = updatedBasicInfo.place;
            publisher.value!.state = updatedBasicInfo.state;
            publisher.value!.countryId = updatedBasicInfo.countryId;

            PublisherService.updatePublisher(
                publisher.value?.id as number,
                publisher.value as Publisher
            ).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchPublisher();
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {
            publisher, icon, publications, 
            totalPublications, switchPage,
            returnCurrentLocaleContent,
            languageTagMap, canEdit, PublisherUpdateForm,
            updateBasicInfo, snackbar, snackbarMessage,
            isAdmin, EntityType, fetchPublisher,
            dataQualityTabsRef, showAssessmentDetails,
            isViceDeanForScience
        };
}})

</script>

<style scoped>
    #publisher .large-publisher-icon {
        font-size: 10em;
    }

    #publisher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
