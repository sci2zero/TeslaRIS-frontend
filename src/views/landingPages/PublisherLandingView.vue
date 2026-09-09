<template>
    <div id="publisher" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!publisher"
            :entity-label="$t('publisherLabel')"
            icon="mdi-account-group"
            :can-edit="canEdit"
            :edit-label="$t('updatePublisherLabel')"
            :entity-type="EntityType.PUBLISHER"
            :entity-id="publisher?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="PublisherUpdateForm"
                    :form-props="{ presetPublisher: publisher }"
                    entity-name="Publisher"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                {{ returnCurrentLocaleContent(publisher?.name) }}
            </template>
            <template #meta>
                <landing-meta-item v-if="publisher?.countryName?.length" :label="$t('countryLabel')" icon="mdi-flag-outline" tone="emerald">
                    {{ returnCurrentLocaleContent(publisher?.countryName) }}
                </landing-meta-item>
                <landing-meta-item v-if="publisher?.place && publisher.place.length > 0" :label="$t('placeLabel')" icon="mdi-map-marker" tone="amber">
                    {{ returnCurrentLocaleContent(publisher?.place) }}
                </landing-meta-item>
                <landing-meta-item v-if="publisher?.state && publisher.state.length > 0" :label="$t('stateLabel')" icon="mdi-map" tone="slate">
                    {{ returnCurrentLocaleContent(publisher?.state) }}
                </landing-meta-item>
            </template>
        </entity-landing-header>

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

        <template v-if="isAdmin && publisher">
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
    </div>
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
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';


export default defineComponent({
    name: "PublisherSeriesLandingPage",
    components: { PublicationTableComponent, GenericCrudModal, Toast, TabContentLoader, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem },
    setup() {
        const { isAdmin } = useUserRole();

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();
        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

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
            publisher,
            publications,
            totalPublications,
            switchPage,
            returnCurrentLocaleContent,
            languageTagMap, canEdit, PublisherUpdateForm,
            updateBasicInfo, snackbar, snackbarMessage,
            isAdmin, EntityType, fetchPublisher,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
