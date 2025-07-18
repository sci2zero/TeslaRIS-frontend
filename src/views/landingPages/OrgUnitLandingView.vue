<template>
    <v-container id="institution">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="primary">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!organisationUnit"
                            type="heading"
                            color="primary"
                            class="d-flex justify-center align-center"
                        >
                            {{ returnCurrentLocaleContent(organisationUnit?.name) }} {{ organisationUnit?.nameAbbreviation ? `(${organisationUnit?.nameAbbreviation})` : "" }}
                        </v-skeleton-loader>
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
                <organisation-unit-logo
                    :filename="organisationUnit?.logoServerFilename"
                    :background-color-hex="organisationUnit?.logoBackgroundHex"
                    :org-unit-id="organisationUnit?.id"
                    :can-edit="canEdit">
                </organisation-unit-logo>
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
                        <basic-info-loader
                            v-if="!organisationUnit"
                            color="grey-lighten-5"
                            :citation-button="false"
                            show-map
                        />
                        <v-row v-else>
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
                                <div>
                                    Open Alex ID:
                                </div>
                                <div class="response">
                                    <identifier-link v-if="organisationUnit?.openAlexId" :identifier="organisationUnit.openAlexId" type="open_alex"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div>
                                    Research Organisation Registry ID:
                                </div>
                                <div class="response">
                                    <identifier-link v-if="organisationUnit?.ror" :identifier="organisationUnit.ror" type="ror"></identifier-link>
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

        <div
            v-show="canEdit"
            class="actions-box pa-4"
        >
            <div class="text-subtitle-1 font-weight-medium mb-3">
                {{ $t("additionalActionsLabel") }}
            </div>
            <div class="d-flex flex-row">
                <generic-crud-modal
                    class="ml-2" 
                    :form-component="ExternalIndicatorsConfigurationForm"
                    :form-props="{ institutionId: organisationUnit?.id }"
                    entity-name="ExternalIndicatorConfiguration"
                    is-update compact
                    primary-color outlined
                    :read-only="!canEdit"
                    @update="updateSuccess"
                />
            </div>
        </div>

        <!-- Keywords -->
        <keyword-list
            :keywords="organisationUnit?.keyword ? organisationUnit.keyword : []"
            :can-edit="canEdit"
            @search-keyword="searchKeyword($event)"
            @update="updateKeywords">
        </keyword-list>

        <br />
        <tab-content-loader v-if="!organisationUnit" :tab-number="5" layout="table" />
        <v-tabs
            v-if="organisationUnit"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="employees">
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

        <v-tabs-window
            v-if="organisationUnit"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publications">
                <!-- Publication Table -->
                <search-bar-component
                    class="mt-5"
                    @search="clearSortAndPerformPublicationSearch($event)"
                />
                <div
                    v-if="canEdit"
                    class="mb-5 mt-5">
                    <add-publication-menu compact />
                    <v-btn
                        v-if="isInstitutionalEditor && canEdit"
                        class="ml-2" color="primary" density="compact"
                        @click="performNavigation('importer')">
                        {{ $t("importerLabel") }}
                    </v-btn>
                </div>
                <v-select
                    v-model="selectedPublicationTypes"
                    :items="publicationTypes"
                    :label="$t('typeOfPublicationLabel')"
                    return-object
                    class="publication-type-select mt-3"
                    multiple
                ></v-select>
                <publication-table-component
                    ref="publicationsRef"
                    :publications="publications"
                    :total-publications="totalPublications"
                    enable-export
                    :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_OUTPUTS"
                    :endpoint-token-parameters="[`${organisationUnit?.id}`, publicationSearchParams]"
                    :endpoint-body-parameters="
                        {
                            allowedTypes: selectedPublicationTypes?.map(publicationType => publicationType.value),
                            institutionId: organisationUnit.id,
                            commissionId: null
                        }"
                    @switch-page="switchPublicationsPage">
                </publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="employees">
                <!-- Employees -->
                <search-bar-component
                    class="mt-5"
                    @search="clearSortAndPerformPersonSearch($event)"
                />
                <person-table-component
                    ref="employeesRef"
                    :persons="employees"
                    :total-persons="totalEmployees"
                    :employment-institution-id="organisationUnit?.id"
                    enable-export
                    allow-comparison
                    :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_EMPLOYEES"
                    :endpoint-token-parameters="[`${organisationUnit?.id}`, personSearchParams, 'false']"
                    @switch-page="switchEmployeesPage"
                    @delete="fetchEmployees(true)">
                </person-table-component>

                <div v-if="totalAlumni > 0">
                    <h1>{{ $t("alumniLabel") }}</h1>
                    <person-table-component
                        ref="alumniRef"
                        :persons="alumni"
                        :total-persons="totalAlumni"
                        is-alumni-table
                        :employment-institution-id="organisationUnit?.id"
                        enable-export
                        :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_EMPLOYEES"
                        :endpoint-token-parameters="[`${organisationUnit?.id}`, personSearchParams, 'true']"
                        @switch-page="switchAlumniPage">
                    </person-table-component>
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
                <div class="mt-5">
                    <h1>{{ $t("subUnitsLabel") }}</h1>
                    <v-row>
                        <v-col>
                            <organisation-unit-table-component
                                :organisation-units="subUnits"
                                :total-o-us="totalSubUnits"
                                allow-comparison
                                enable-export
                                :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_SEARCH"
                                :endpoint-token-parameters="['*', String(organisationUnit.id)]"
                                :top-level-institution-id="organisationUnit.id"
                                @switch-page="switchSubUnitsPage">
                            </organisation-unit-table-component>
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
                <indicators-section 
                    :indicators="ouIndicators" 
                    :applicable-types="[ApplicableEntityType.ORGANISATION_UNIT]" 
                    :entity-id="organisationUnit?.id"
                    :entity-type="ApplicableEntityType.PERSON" 
                    :can-edit="false"
                    show-statistics
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import OpenLayersMap from '../../components/core/OpenLayersMap.vue';
import RelationsGraph from '../../components/core/RelationsGraph.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import type { OrganisationUnitIndex, OrganisationUnitRelationRequest, OrganisationUnitRelationResponse, OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import KeywordList from '@/components/core/KeywordList.vue';
import { useI18n } from 'vue-i18n';
import { ApplicableEntityType, ExportableEndpointType, type MultilingualContent } from '@/models/Common';
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
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import { useLoginStore } from '@/stores/loginStore';
import Toast from '@/components/core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import OrganisationUnitLogo from '@/components/organisationUnit/OrganisationUnitLogo.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import ExternalIndicatorsConfigurationForm from '@/components/assessment/indicators/ExternalIndicatorsConfigurationForm.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import { getPublicationTypesForGivenLocale } from '@/i18n/publicationType';
import AddPublicationMenu from '@/components/publication/AddPublicationMenu.vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';


export default defineComponent({
    name: "OrgUnitLanding",
    components: { PublicationTableComponent, OpenLayersMap, ResearchAreaHierarchy, Toast, RelationsGraph, KeywordList, PersonTableComponent, GenericCrudModal, OrganisationUnitRelationUpdateModal, ResearchAreasUpdateModal, IndicatorsSection, OrganisationUnitTableComponent, IdentifierLink, UriList, OrganisationUnitLogo, BasicInfoLoader, TabContentLoader, AddPublicationMenu, SearchBarComponent },
    setup() {
        const currentTab = ref("relations");

        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const router = useRouter();
        const currentRoute = useRoute();

        const organisationUnit = ref<OrganisationUnitResponse>();

        const graphRef = ref<typeof RelationsGraph>();
        const relationChain = ref();
        
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
        const publicationSearchParams = ref("tokens=*");

        const employeesPage = ref(0);
        const employeesSize = ref(1);
        const employeesSort = ref("");
        const employeesDirection = ref("");
        const alumniPage = ref(0);
        const alumniSize = ref(1);
        const alumniSort = ref("");
        const alumniDirection = ref("");
        const personSearchParams = ref("tokens=*");

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
        const { isAdmin, isInstitutionalEditor } = useUserRole();
        const publicationTypes = computed(() => getPublicationTypesForGivenLocale());
        const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);

        const employeesRef = ref<typeof PersonTableComponent>();
        const alumniRef = ref<typeof PersonTableComponent>();
        const publicationsRef = ref<typeof PublicationTableComponent>();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                OrganisationUnitService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });

                StatisticsService.registerOUView(parseInt(currentRoute.params.id as string));
            }

            fetchOU(true);
            fetchIndicators();
            fetchRelations();

            OrganisationUnitService.getAllRelationsForSourceOU(parseInt(currentRoute.params.id as string)).then((response) => {
                relations.value = response.data;
            });

            selectedPublicationTypes.value.splice(0);
            publicationTypes.value?.forEach(publicationType => {
                selectedPublicationTypes.value.push(
                    {title: publicationType.title, value: publicationType.value}
                );
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

        const fetchIndicators = () => {
            EntityIndicatorService.fetchOUIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                ouIndicators.value = response.data;
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
                selectedPublicationTypes.value.map(publicationType => publicationType.value),
                `${publicationSearchParams.value}&page=${publicationsPage.value}&size=${publicationsSize.value}&sort=${publicationsSort.value}`
            ).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements;
            });
        };

        const fetchEmployees = (fetchAlumni: boolean) => {
            return PersonService.findEmployeesForOU(
                parseInt(currentRoute.params.id as string),
                `${personSearchParams.value}&page=${employeesPage.value}&size=${employeesSize.value}&sort=${employeesSort.value},${employeesDirection.value}`,
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

        const clearSortAndPerformPersonSearch = (tokenParams: string) => {
            personSearchParams.value = tokenParams;
            employeesRef.value?.setSortAndPageOption([], 1);
            alumniRef.value?.setSortAndPageOption([], 1);
            employeesPage.value = 0;
            employeesSort.value = "";
            employeesDirection.value = "";
            fetchEmployees(false);
            fetchEmployees(true);
        };

        const clearSortAndPerformPublicationSearch = (tokenParams: string) => {
            publicationSearchParams.value = tokenParams;
            publicationsRef.value?.setSortAndPageOption([], 1);
            publicationsPage.value = 0;
            publicationsSort.value = "";
            publicationsDirection.value = "";
            fetchPublications();
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
            organisationUnit.value!.openAlexId = basicInfo.openAlexId;
            organisationUnit.value!.ror = basicInfo.ror;
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
                updateSuccess();
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
                updateSuccess();
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

        const updateSuccess = () => {
            snackbarMessage.value = i18n.t("updatedSuccessMessage");
            snackbar.value = true;
        };

        const performNavigation = (pageName: string) => {
            router.push({name: pageName});
        };

        return {
            organisationUnit, currentTab,
            publications, totalPublications,
            employees, totalEmployees, publicationsRef,
            switchPublicationsPage, publicationTypes,
            switchEmployeesPage, isAdmin, performNavigation,
            searchKeyword, relationChain, selectedPublicationTypes,
            returnCurrentLocaleContent, canEdit,
            updateKeywords, updateBasicInfo,
            snackbar, snackbarMessage, relations,
            updateRelations, graphRef, updateResearchAreas,
            subUnits, totalSubUnits, switchSubUnitsPage,
            alumni, totalAlumni, switchAlumniPage,
            OrganisationUnitUpdateForm, fetchEmployees,
            ouIndicators, StatisticsType, loginStore,
            ExportableEndpointType, updateSuccess,
            ExternalIndicatorsConfigurationForm,
            ApplicableEntityType, fetchIndicators,
            clearSortAndPerformPersonSearch,
            clearSortAndPerformPublicationSearch,
            employeesRef, alumniRef, personSearchParams,
            publicationSearchParams, isInstitutionalEditor
        };
}})

</script>

<style scoped>
    #institution .large-institution-icon {
        font-size: 10em;
    }

    #institution .response {
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

    .publication-type-select {
        max-width: 500px;
    }

</style>
