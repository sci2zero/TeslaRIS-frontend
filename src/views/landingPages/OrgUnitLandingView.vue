<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="primary">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(organisationUnit?.name as MultilingualContent[]) }}
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
                        <div class="edit-pen">
                            <v-btn icon variant="outlined"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
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
                            </v-col>
                            <v-col cols="6">
                                <div>
                                    <open-layers-map
                                        ref="mapRef" height="150px" :init-coordinates="[organisationUnit?.location?.longitude as number, organisationUnit?.location?.latitude as number]" :read-only="true"
                                        :show-input="false"></open-layers-map>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="keywords" @search-keyword="searchKeyword($event)"></keyword-list>

        <!-- Research Area -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

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
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>{{ $t("relationsLabel") }}</b></div>
                        <relations-graph></relations-graph>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import OpenLayersMap from '../../components/core/OpenLayersMap.vue';
import RelationsGraph from '../../components/core/RelationsGraph.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { MultilingualContent } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';

export default defineComponent({
    name: "OrgUnitLanding",
    components: { PublicationTableComponent, OpenLayersMap, ResearchAreaHierarchy, RelationsGraph },
    setup() {
        const router = useRouter();
        const currentRoute = useRoute();

        const organisationUnit = ref<OrganisationUnitResponse>();
        const relationChain = ref<OrganisationUnitResponse[]>();

        const keywords = ref<string[]>([]);
        const ouIcon = ref('mdi-city')
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            OrganisationUnitService.readOU(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                organisationUnit.value = response.data;
                
                fetchPublications();                
                populateData();
            });
            OrganisationUnitService.readOURelationsChain(parseInt(currentRoute.params.id as string)).then((response) => {
                relationChain.value = response.data;
            })
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const populateData = () => {
            keywords.value = returnCurrentLocaleContent(organisationUnit.value?.keyword as MultilingualContent[])?.split(",") as string[];
        }

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim() }})        
        };

        return {
                organisationUnit,
                keywords, ouIcon,
                publications, 
                totalPublications,
                switchPage,
                searchKeyword,
                returnCurrentLocaleContent
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
