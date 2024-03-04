<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="primary">
                    <v-card-title class="text-h5 text-center">
                        Fakultet Tehnickih Nauka
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        Organisation Unit
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-card class="pa-3 h-100" variant="flat" color="secondary">
                    <v-icon size="x-large" class="large-researcher-icon">
                        {{ accountIcon }}
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
                            <b>Personal Info</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>
                                    Email
                                </div>
                                <div class="response">
                                    dean@ftn.uns.ac.rs
                                </div>
                                <div>
                                    Phone:
                                </div>
                                <div class="response">
                                    015/145-168
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div>
                                    <open-layers-map
                                        ref="mapRef" height="150px" :init-cordinates="[19.8335, 45.2671]" :read-only="true"
                                        :show-input="false"></open-layers-map>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>Keywords</b></div>
                        <v-chip v-for="(keyword, index) in keywords" :key="index" outlined @click="searchKeyword(keyword)">
                            {{ keyword }}
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

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

                        <div><b>Research Area</b></div>
                        <research-area-hierarchy :research-area="organisationUnit.researchAreas"></research-area-hierarchy>
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

                        <div><b>Relation</b></div>
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

import type { MultilingualContent, Country } from '@/models/Common';
import PersonService from '@/services/PersonService';
import CountryService from '@/services/CountryService';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { PersonResponse } from '@/models/PersonUserModel';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import OpenLayersMap from '../../components/core/OpenLayersMap.vue';
import RelationsGraph from '../../components/core/RelationsGraph.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';

export default defineComponent({
    name: "OrgUnitLanding",
    components: { PublicationTableComponent, OpenLayersMap, ResearchAreaHierarchy, RelationsGraph },
    setup() {
        const router = useRouter();
        const currentRoute = useRoute();


        const organisationUnit = ref({
            "id": 97,
            "name": [
                {
                    "languageTagId": 26,
                    "languageTag": "SR",
                    "content": "Drugi FAX",
                    "priority": 1
                }
            ],
            "nameAbbreviation": "org-unit-1",
            "keyword": [
                {
                    "languageTagId": 26,
                    "languageTag": "SR",
                    "content": "OU1",
                    "priority": 1
                }
            ],
            "researchAreas": [
                {
                    "id": 1,
                    "name": [
                        {
                            "languageTagId": 26,
                            "languageTag": "SR",
                            "content": "Katedra za inf",
                            "priority": 2
                        }
                    ],
                    "description": [],
                    "superResearchArea": {
                        "id": 2,
                        "name": [
                            {
                                "languageTagId": 26,
                                "languageTag": "SR",
                                "content": "Elektrotehnicko i racunarsko inzenjerstvo",
                                "priority": 2
                            }
                        ],
                        "description": [{
                                "languageTagId": 26,
                                "languageTag": "SR",
                                "content": "Description Elektrotehnicko i racunarsko inzenjerstvo",
                                "priority": 2
                            }],
                        "superResearchArea": null
                    }
                }
            ],
            "location": {
                "longitude": 21.0059,
                "latitude": 44.0165,
                "address": null
            },
            "contact": {
                "contactEmail": "office@ou.uns.ac.rs",
                "phoneNumber": "021654123"
            }
});


        const person = ref<PersonResponse>();
        const country = ref<Country>();
        const mapRef = ref<typeof OpenLayersMap>();



        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const researcherName = ref("");
        const accountIcon = ref('mdi-city')

        const personalInfo = ref<any>({contact: {}});
        
        const keywords = ref(["test"]);
        const biography = ref();
        const expertises = ref([
            {
                title: "CyberSecurity",
                desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
                attachments: [
                    {name: "attahment1"},
                    {name: "attahment1"}
                ]
            },
            {
                title: "CyberSecurity 2",
                desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
                attachments: [
                    {name: "attahment1"}
                ]
            },
        ])

        const involvements = ref([
            {
                title: "FTN",
                yearStart: "2020",
                yearEnd: "Present",
                desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
                attachments: [
                    {name: "Diploma BSc"},
                    {name: "Diploma MSc"}
                ]
            },
            {
                title: "FZŽ",
                yearStart: "2020",
                yearEnd: "Present",
                desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum deserunt voluptatum deleniti neque beatae itaque, dignissimos eveniet possimus sit ipsa",
                attachments: [
                    {name: "Dipl"},
                ]
            },
        ]);

        onMounted(() => {
            PersonService.readPerson(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                person.value = response.data;
                if (response.data.personName.otherName !== null && response.data.personName.otherName !== "") {
                    researcherName.value = `${response.data.personName.firstname} ${response.data.personName.otherName} ${response.data.personName.lastname}`;
                } else {
                    researcherName.value = `${response.data.personName.firstname} ${response.data.personName.lastname}`;
                }

                fetchPublications();                
                populateData();
            });
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const populateData = () => {
            // if (person.value === undefined) {
            //     return;
            // }

            // personalInfo.value = person.value.personalInfo;
            //     personalInfo.value.streetAndNumber = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.streetAndNumber as MultilingualContent[]);
            //     personalInfo.value.city = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.city as MultilingualContent[]);

            //     fetchAndSetCountryInfo();

            //     // TODO: Improve this!!!
            //     keywords.value = returnCurrentLocaleContent(person.value.keyword)?.split(",") as string[];

            //     biography.value = returnCurrentLocaleContent(person.value.biography);
        }


        const returnCurrentLocaleContent = (multilingualContentList: MultilingualContent[]): string | null => {
            let selectedContent: MultilingualContent | null = null;
            
            multilingualContentList.forEach((multilingualContent) => {
                if (multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    selectedContent = multilingualContent;
                }
            });

            if (selectedContent) {
                return (selectedContent as MultilingualContent).content;
            } else {

                if (multilingualContentList.length === 0) {
                    return null;
                }

                const maxPriorityContent = multilingualContentList.reduce((prev, current) => {
                    return (prev.priority > current.priority) ? prev : current;
                });
                
                return maxPriorityContent.content;
            }
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            DocumentPublicationService.findResearcherPublications(person.value?.id as number, `page=${page.value}&size=${size.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim() }})        
        };

        return {
                organisationUnit,
                researcherName,
                accountIcon,
                personalInfo,
                keywords,
                biography,
                expertises,
                involvements,
                publications, 
                totalPublications,
                switchPage,
                searchKeyword
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
