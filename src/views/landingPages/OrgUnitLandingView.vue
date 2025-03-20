<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="primary">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(organisationUnit?.name) }} {{ organisationUnit?.nameAbbreviation ? `(${organisationUnit?.nameAbbreviation})` : "" }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("organisationUnitLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-card class="pa-3 h-100" variant="flat" color="secondary">
                    <v-icon size="x-large" class="large-researcher-icon">
                        {{ ouIcon }}
                    </v-icon>
                </v-card>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <organisation-unit-update-modal :preset-o-u="organisationUnit" :read-only="!canEdit" @update="updateBasicInfo"></organisation-unit-update-modal> -->
                        <generic-crud-modal
                            :form-component="OrganisationUnitUpdateForm"
                            :form-props="{ presetOU: organisationUnit }"
                            entity-name="OrganisationUnit"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>
                                    {{ $t("addressLabel") }}:
                                </div>
                                <div class="response">
                                    {{ organisationUnit?.location?.address ? organisationUnit?.location?.address : $t("notYetSetMessage") }}
                                </div>
                                <div>
                                    {{ $t("emailLabel") }}:
                                </div>
                                <div class="response">
                                    <identifier-link v-if="organisationUnit?.contact?.contactEmail" :identifier="organisationUnit?.contact.contactEmail" type="email"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div v-if="loginStore.userLoggedIn">
                                    {{ $t("phoneNumberLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn" class="response">
                                    {{ organisationUnit?.contact?.phoneNumber ? organisationUnit?.contact?.phoneNumber : $t("notYetSetMessage") }}
                                </div>
                                <div>
                                    Scopus AFID:
                                </div>
                                <div class="response">
                                    <identifier-link v-if="organisationUnit?.scopusAfid" :identifier="organisationUnit.scopusAfid" type="scopus_affiliation"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div v-if="organisationUnit?.uris && organisationUnit.uris.length > 0">
                                    {{ $t("websiteLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="organisationUnit?.uris"></uri-list>
                                </div>
                            </v-col>
                            <v-col v-if="organisationUnit?.location?.latitude && organisationUnit?.location?.longitude" cols="6">
                                <div>
                                    <open-layers-map
                                        ref="mapRef" height="250px" :init-coordinates="[organisationUnit?.location?.longitude as number, organisationUnit?.location?.latitude as number]" :read-only="true"
                                        :show-input="false"></open-layers-map>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="organisationUnit?.keyword ? organisationUnit.keyword : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <br />
        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab v-if="totalPublications > 0" value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab v-if="totalEmployees > 0 || canEdit" value="employees">
                {{ $t("employeesLabel") }}
            </v-tab>
            <v-tab value="relations">
                {{ $t("relationsLabel") }}
            </v-tab>
            <v-tab value="researchAreas">
                {{ $t("researchAreasLabel") }}
            </v-tab>
            <v-tab v-if="ouIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="publications">
                <!-- Publication Table -->
                <h1>{{ $t("publicationsLabel") }}</h1>
                <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPublicationsPage"></publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="employees">
                <!-- Employees -->
                <h1>{{ $t("employeesLabel") }}</h1>
                <person-table-component
                    :persons="employees" :total-persons="totalEmployees" :employment-institution-id="organisationUnit?.id" @switch-page="switchEmployeesPage"
                    @delete="fetchEmployees(true)"></person-table-component>

                <div v-if="totalAlumni > 0">
                    <h1>{{ $t("alumniLabel") }}</h1>
                    <person-table-component :persons="alumni" :total-persons="totalAlumni" is-alumni-table @switch-page="switchAlumniPage"></person-table-component>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="relations">
                <!-- Relations -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <organisation-unit-relation-update-modal :relations="relations" :source-o-u="organisationUnit" :read-only="!canEdit || !isAdmin" @update="updateRelations"></organisation-unit-relation-update-modal>

                                <div><b>{{ $t("relationsLabel") }}</b></div>
                                <relations-graph ref="graphRef" :nodes="relationChain?.nodes" :links="relationChain?.links"></relations-graph>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <div v-if="totalSubUnits > 0">
                    <h1>{{ $t("subUnitsLabel") }}</h1>
                    <v-row>
                        <v-col>
                            <organisation-unit-table-component :organisation-units="subUnits" :total-o-us="totalSubUnits" @switch-page="switchSubUnitsPage"></organisation-unit-table-component>
                        </v-col>
                    </v-row>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="researchAreas">
                <!-- Research Area -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <research-areas-update-modal :research-areas-hierarchy="organisationUnit?.researchAreas" :read-only="!canEdit" @update="updateResearchAreas"></research-areas-update-modal>

                                <div><b>{{ $t("researchAreasLabel") }}</b></div>
                                <research-area-hierarchy :research-areas="organisationUnit?.researchAreas"></research-area-hierarchy>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <div class="w-50 statistics">
                    <statistics-view :entity-indicators="ouIndicators" :statistics-type="StatisticsType.VIEW"></statistics-view>
                </div>
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import OpenLayersMap from '../../components/core/OpenLayersMap.vue';
import RelationsGraph from '../../components/core/RelationsGraph.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import type { OrganisationUnitIndex, OrganisationUnitRelationRequest, OrganisationUnitRelationResponse, OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import KeywordList from '@/components/core/KeywordList.vue';
import { useI18n } from 'vue-i18n';
import type { MultilingualContent } from '@/models/Common';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import OrganisationUnitRelationUpdateModal from '@/components/organisationUnit/update/OrganisationUnitRelationUpdateModal.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import ResearchAreasUpdateModal from '@/components/core/ResearchAreasUpdateModal.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import OrganisationUnitTableComponent from '@/components/organisationUnit/OrganisationUnitTableComponent.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import UriList from '@/components/core/UriList.vue';
import OrganisationUnitUpdateForm from '@/components/organisationUnit/update/OrganisationUnitUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import StatisticsView from '@/components/assessment/statistics/StatisticsView.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import { useLoginStore } from '@/stores/loginStore';
import Toast from '@/components/core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "OrgUnitLanding",
    components: { PublicationTableComponent, OpenLayersMap, ResearchAreaHierarchy, Toast, RelationsGraph, KeywordList, PersonTableComponent, GenericCrudModal, OrganisationUnitRelationUpdateModal, ResearchAreasUpdateModal, StatisticsView, OrganisationUnitTableComponent, IdentifierLink, UriList },
    setup() {
        const currentTab = ref("");

        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const router = useRouter();
        const currentRoute = useRoute();

        const organisationUnit = ref<OrganisationUnitResponse>();

        const graphRef = ref<typeof RelationsGraph>();
        const relationChain = ref();

        const ouIcon = ref('mdi-city');
        
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const employees = ref<PersonIndex[]>([]);
        const totalEmployees = ref<number>(0);

        const alumni = ref<PersonIndex[]>([]);
        const totalAlumni = ref<number>(0);

        const publicationsPage = ref(0);
        const publicationsSize = ref(1);
        const publicationsSort = ref("");
        const publicationsDirection = ref("");

        const employeesPage = ref(0);
        const employeesSize = ref(1);
        const employeesSort = ref("");
        const employeesDirection = ref("");

        const alumniPage = ref(0);
        const alumniSize = ref(1);
        const alumniSort = ref("");
        const alumniDirection = ref("");

        const subUnitsPage = ref(0);
        const subUnitsSize = ref(1);
        const subUnitsSort = ref("");
        const subUnitsDirection = ref("");

        const canEdit = ref(false);

        const i18n = useI18n();

        const relations = ref<OrganisationUnitRelationResponse[]>([]);
        
        const subUnits = ref<OrganisationUnitIndex[]>([]);
        const totalSubUnits = ref<number>(0);

        const ouIndicators = ref<EntityIndicatorResponse[]>([]);

        const loginStore = useLoginStore();
        const { isAdmin } = useUserRole();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                OrganisationUnitService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });

                StatisticsService.registerOUView(parseInt(currentRoute.params.id as string));
            }

            fetchOU(true);
            EntityIndicatorService.fetchOUIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                ouIndicators.value = response.data;
            });
            fetchRelations();

            OrganisationUnitService.getAllRelationsForSourceOU(parseInt(currentRoute.params.id as string)).then((response) => {
                relations.value = response.data;
            });
        });

        const fetchOU = (uponStartup: boolean) => {
            OrganisationUnitService.readOU(parseInt(currentRoute.params.id as string)).then((response) => {
                organisationUnit.value = response.data;

                document.title = returnCurrentLocaleContent(organisationUnit.value.name) as string;
                
                if(uponStartup) {
                    Promise.all([fetchPublications(), fetchEmployees(false), fetchEmployees(true)]).then(() => {
                        setStartTab();
                    });
                }

                fetchSubUnits();
            });
        };

        const fetchSubUnits = () => {
            OrganisationUnitService.readOUSubUnits(
                parseInt(currentRoute.params.id as string),
                `page=${subUnitsPage.value}&size=${subUnitsSize.value}&sort=${subUnitsSort.value}`
            ).then((response) => {
                subUnits.value = response.data.content;
                totalSubUnits.value = response.data.totalElements;
            });
        };

        const fetchRelations = () => {
            OrganisationUnitService.readOURelationsGraph(parseInt(currentRoute.params.id as string)).then((response) => {
                relationChain.value = response.data;
                if(graphRef.value) {
                    graphRef.value.rendered = false;
                }
            });
        };

        const switchSubUnitsPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            subUnitsPage.value = nextPage;
            subUnitsSize.value = pageSize;
            subUnitsSort.value = sortField;
            subUnitsDirection.value = sortDir;
            fetchSubUnits();
        };

        const switchPublicationsPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            publicationsPage.value = nextPage;
            publicationsSize.value = pageSize;
            publicationsSort.value = sortField;
            publicationsDirection.value = sortDir;
            fetchPublications();
        };

        const switchEmployeesPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            employeesPage.value = nextPage;
            employeesSize.value = pageSize;
            employeesSort.value = sortField;
            employeesDirection.value = sortDir;
            fetchEmployees(false);
        };

        const switchAlumniPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            alumniPage.value = nextPage;
            alumniSize.value = pageSize;
            alumniSort.value = sortField;
            alumniDirection.value = sortDir;
            fetchEmployees(true);
        };

        const fetchPublications = () => {
            return DocumentPublicationService.findPublicationsForOrganisationUnit(
                parseInt(currentRoute.params.id as string),
                `page=${publicationsPage.value}&size=${publicationsSize.value}&sort=${publicationsSort.value}`
            ).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements;
            });
        };

        const fetchEmployees = (fetchAlumni: boolean) => {
            return PersonService.findEmployeesForOU(
                parseInt(currentRoute.params.id as string),
                `page=${employeesPage.value}&size=${employeesSize.value}&sort=${employeesSort.value},${employeesDirection.value}`,
                fetchAlumni
            ).then((response) => {
                if (fetchAlumni) {
                    alumni.value = response.data.content;
                    totalAlumni.value = response.data.totalElements;
                } else {
                    employees.value = response.data.content;
                    totalEmployees.value = response.data.totalElements;
                }
            });
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else if( totalEmployees.value > 0) {
                currentTab.value = "employees";
            } else {
                currentTab.value = "relations";
            }
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            organisationUnit.value!.keyword = keywords;
            performUpdate(false);
        };

        const updateBasicInfo = (basicInfo: OrganisationUnitRequest) => {
            organisationUnit.value!.name = basicInfo.name;
            organisationUnit.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            organisationUnit.value!.location = basicInfo.location;
            organisationUnit.value!.contact = basicInfo.contact;
            organisationUnit.value!.scopusAfid = basicInfo.scopusAfid;
            organisationUnit.value!.uris = basicInfo.uris;
            performUpdate(false);
        };

        const updateRelations = async (newRelations: OrganisationUnitRelationRequest[], toDelete: number[]) => {
            await Promise.all(toDelete.map(relationIdToDelete => OrganisationUnitService.deleteOURelation(relationIdToDelete)));

            const relationsForUpdate = newRelations.filter(relation => relation.id);
            const relationsToAdd = newRelations.filter(relation => !relation.id);

            if (relationsForUpdate.length === 0) {
                await addNewRelations(relationsToAdd);
                return;
            }

            await Promise.all(relationsForUpdate.map(relation => OrganisationUnitService.updateOURelation(relation, relation.id)));

            if (relationsToAdd.length > 0) {
                await addNewRelations(relationsToAdd);
            }

            await fetchAndSetRelations();
        };

        const addNewRelations = async (relationsToAdd: OrganisationUnitRelationRequest[]) => {
            await Promise.all(relationsToAdd.map(relation => OrganisationUnitService.createOURelation(relation)));
            await fetchAndSetRelations();
        };

        const fetchAndSetRelations = async () => {
            await fetchRelations();
            const sourceOUId = parseInt(currentRoute.params.id as string);
            const response = await OrganisationUnitService.getAllRelationsForSourceOU(sourceOUId);
            relations.value = response.data;
        };

        const updateResearchAreas = (researchAreaIds: number[]) => {
            const updateRequest: OrganisationUnitRequest = {
                name: organisationUnit.value!.name,
                nameAbbreviation: organisationUnit.value?.nameAbbreviation,
                keyword: organisationUnit.value!.keyword,
                researchAreasId: researchAreaIds,
                location: organisationUnit.value?.location,
                contact: organisationUnit.value?.contact,
                uris: organisationUnit.value?.uris as string[]
            };

            OrganisationUnitService.updateOrganisationUnit(organisationUnit.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchOU(false);
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                fetchOU(false);
            });
        };

        const performUpdate = (reload: boolean) => {
            const updateRequest: OrganisationUnitRequest = {
                name: organisationUnit.value!.name,
                nameAbbreviation: organisationUnit.value?.nameAbbreviation,
                keyword: organisationUnit.value!.keyword,
                researchAreasId: organisationUnit.value!.researchAreas.map(leafResearchArea => leafResearchArea.id as number),
                location: organisationUnit.value?.location,
                contact: organisationUnit.value?.contact,
                scopusAfid: organisationUnit.value?.scopusAfid,
                uris: organisationUnit.value?.uris as string[]
            };

            OrganisationUnitService.updateOrganisationUnit(organisationUnit.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchOU(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchOU(false);
                }
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "organisationUnits" }});
        };

        return {
            organisationUnit,
            ouIcon, currentTab,
            publications, 
            totalPublications,
            employees, totalEmployees,
            switchPublicationsPage,
            switchEmployeesPage, isAdmin,
            searchKeyword, relationChain,
            returnCurrentLocaleContent, canEdit,
            updateKeywords, updateBasicInfo,
            snackbar, snackbarMessage, relations,
            updateRelations, graphRef, updateResearchAreas,
            subUnits, totalSubUnits, switchSubUnitsPage,
            alumni, totalAlumni, switchAlumniPage,
            OrganisationUnitUpdateForm, fetchEmployees,
            ouIndicators, StatisticsType, loginStore
        };
}})

</script>

<style scoped>
    #researcher .large-researcher-icon {
        font-size: 10em;
    }

    #researcher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }
</style>
