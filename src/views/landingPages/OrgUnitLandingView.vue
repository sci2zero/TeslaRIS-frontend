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
                        <organisation-unit-update-modal :preset-o-u="organisationUnit" :read-only="!canEdit" @update="updateBasicInfo"></organisation-unit-update-modal>

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
                                    {{ organisationUnit?.contact?.contactEmail ? organisationUnit?.contact?.contactEmail : $t("notYetSetMessage") }}
                                </div>
                                <div>
                                    {{ $t("phoneNumberLabel") }}:
                                </div>
                                <div class="response">
                                    {{ organisationUnit?.contact?.phoneNumber ? organisationUnit?.contact?.phoneNumber : $t("notYetSetMessage") }}
                                </div>
                                <div>
                                    Scopus AFID:
                                </div>
                                <div class="response">
                                    {{ organisationUnit?.scopusAfid ? organisationUnit?.scopusAfid : $t("notYetSetMessage") }}
                                </div>
                                <div class="w-50">
                                    <statistics-view :entity-indicators="ouIndicators" :statistics-type="StatisticsType.VIEW"></statistics-view>
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

        <!-- Research Area -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <research-ares-update-modal :research-areas-hierarchy="organisationUnit?.researchAreas" :read-only="!canEdit" @update="updateResearchAreas"></research-ares-update-modal>

                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy :research-areas="organisationUnit?.researchAreas"></research-area-hierarchy>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>


        <!-- Relations -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <organisation-unit-relation-update-modal :relations="relations" :source-o-u="organisationUnit" :read-only="!canEdit" @update="updateRelations"></organisation-unit-relation-update-modal>

                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <relations-graph ref="graphRef" :nodes="relationChain?.nodes" :links="relationChain?.links"></relations-graph>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Employee Table -->
        <br />
        <h1>{{ $t("employeesLabel") }}</h1>
        <person-table-component :persons="employees" :total-persons="totalEmployees" @switch-page="switchEmployeesPage"></person-table-component>

        <!-- Publication Table -->
        <br />
        <h1>{{ $t("publicationsLabel") }}</h1>
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPublicationsPage"></publication-table-component>
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
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import OpenLayersMap from '../../components/core/OpenLayersMap.vue';
import RelationsGraph from '../../components/core/RelationsGraph.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import type { OrganisationUnitRelationRequest, OrganisationUnitRelationResponse, OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import KeywordList from '@/components/core/KeywordList.vue';
import { useI18n } from 'vue-i18n';
import type { MultilingualContent } from '@/models/Common';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import OrganisationUnitUpdateModal from '@/components/organisationUnit/update/OrganisationUnitUpdateModal.vue';
import OrganisationUnitRelationUpdateModal from '@/components/organisationUnit/update/OrganisationUnitRelationUpdateModal.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import ResearchAresUpdateModal from '@/components/core/ResearchAresUpdateModal.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import StatisticsService from '@/services/StatisticsService';
import StatisticsView from '@/components/assessment/statistics/StatisticsView.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';


export default defineComponent({
    name: "OrgUnitLanding",
    components: { PublicationTableComponent, OpenLayersMap, ResearchAreaHierarchy, RelationsGraph, KeywordList, PersonTableComponent, OrganisationUnitUpdateModal, OrganisationUnitRelationUpdateModal, ResearchAresUpdateModal, StatisticsView },
    setup() {
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

        const publicationsPage = ref(0);
        const publicationsSize = ref(1);
        const publicationsSort = ref("");
        const publicationsDirection = ref("");

        const employeesPage = ref(0);
        const employeesSize = ref(1);
        const employeesSort = ref("");
        const employeesDirection = ref("");

        const canEdit = ref(false);

        const i18n = useI18n();

        const relations = ref<OrganisationUnitRelationResponse[]>([]);

        const ouIndicators = ref<EntityIndicatorResponse[]>([]);

        onMounted(() => {
            OrganisationUnitService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchOU();
            StatisticsService.registerOUView(parseInt(currentRoute.params.id as string));
            EntityIndicatorService.fetchOUIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                ouIndicators.value = response.data;
            });
            fetchRelations();

            OrganisationUnitService.getAllRelationsForSourceOU(parseInt(currentRoute.params.id as string)).then((response) => {
                relations.value = response.data;
            });
        });

        const fetchOU = () => {
            OrganisationUnitService.readOU(parseInt(currentRoute.params.id as string)).then((response) => {
                organisationUnit.value = response.data;

                document.title = returnCurrentLocaleContent(organisationUnit.value.name) as string;
                
                fetchEmployees();
                fetchPublications();
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
            fetchEmployees();
        };

        const fetchPublications = () => {
            if (!organisationUnit.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsForOrganisationUnit(organisationUnit.value?.id as number, `page=${publicationsPage.value}&size=${publicationsSize.value}&sort=${publicationsSort.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchEmployees = () => {
            PersonService.findEmployeesForOU(parseInt(currentRoute.params.id as string), `page=${employeesPage.value}&size=${employeesSize.value}&sort=${employeesSort.value},${employeesDirection.value}`).then((response) => {
                employees.value = response.data.content;
                totalEmployees.value = response.data.totalElements;
            });
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
                contact: organisationUnit.value?.contact
            };

            OrganisationUnitService.updateOrganisationUnit(organisationUnit.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchOU();
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                fetchOU();
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
                scopusAfid: organisationUnit.value?.scopusAfid
            };

            OrganisationUnitService.updateOrganisationUnit(organisationUnit.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchOU();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchOU();
                }
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "organisationUnits" }});
        };

        return {
            organisationUnit,
            ouIcon,
            publications, 
            totalPublications,
            employees, totalEmployees,
            switchPublicationsPage,
            switchEmployeesPage,
            searchKeyword, relationChain,
            returnCurrentLocaleContent, canEdit,
            updateKeywords, updateBasicInfo,
            snackbar, snackbarMessage, relations,
            updateRelations, graphRef, updateResearchAreas,
            ouIndicators, StatisticsType
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
