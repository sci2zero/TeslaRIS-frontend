<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ researcherName }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        Researcher
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-researcher-icon">
                    {{ accountIcon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
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
                                <div v-if="personalInfo.localBirthDate">
                                    BirthDate:
                                </div>
                                <div v-if="personalInfo.localBirthDate" class="response">
                                    {{ personalInfo.localBirthDate }}
                                </div>
                                <div v-if="personalInfo.sex">
                                    Sex:
                                </div>
                                <div v-if="personalInfo.localBirthDate" class="response">
                                    {{ personalInfo.sex }}
                                </div>
                                <div v-if="personalInfo.country">
                                    Country:
                                </div>
                                <div v-if="personalInfo.sex" class="response">
                                    {{ personalInfo.country }}
                                </div>
                                <div>APVNT:</div>
                                <div class="response">
                                    {{ personalInfo.apvnt ? personalInfo.apvnt : $t("notYetSetMessage") }}
                                </div>
                                <div>MNID:</div>
                                <div class="response">
                                    {{ personalInfo.mnid ? personalInfo.mnid : $t("notYetSetMessage") }}
                                </div>
                                <div>ORCID:</div>
                                <div class="response">
                                    {{ personalInfo.orcid ? personalInfo.orcid : $t("notYetSetMessage") }}
                                </div>
                                <div>Scopus Author ID:</div>
                                <div class="response">
                                    {{ personalInfo.scopusAuthorId ? personalInfo.scopusAuthorId : $t("notYetSetMessage") }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="personalInfo.streetAndNumber">
                                    Street and Number:
                                </div>
                                <div v-if="personalInfo.streetAndNumber" class="response">
                                    {{ personalInfo.streetAndNumber }}
                                </div>
                                <div v-if="personalInfo.city">
                                    City:
                                </div>
                                <div v-if="personalInfo.city" class="response">
                                    {{ personalInfo.city }}
                                </div>
                                <div v-if="personalInfo.placeOfBrith">
                                    Place of Birth:
                                </div>
                                <div v-if="personalInfo.placeOfBrith" class="response">
                                    {{ personalInfo.placeOfBrith }}
                                </div>
                                <div v-if="personalInfo.contact.contactEmail">
                                    Contact Email:
                                </div>
                                <div v-if="personalInfo.contact.contactEmail" class="response">
                                    {{ personalInfo.contact.contactEmail }}
                                </div>
                                <div v-if="personalInfo.contact.phoneNumber">
                                    Phone Number:
                                </div>
                                <div v-if="personalInfo.contact.phoneNumber" class="response">
                                    {{ personalInfo.contact.phoneNumber }}
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

        <!-- Biography -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>Biography</b></div>
                        <p>{{ biography }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Expertises and Skills -->
        <v-row>
            <v-col cols="6">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>
                        <div><b>Expertises and Skills</b></div>
                        
                        <div v-for="(expertise, index) in expertises" :key="index" class="py-5">
                            <h4><strong>{{ expertise.title }}</strong></h4>
                            <p>{{ expertise.desc }}</p>
                            
                            <!-- <v-list dense>
                                <v-list-item v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex">
                                    <v-list-item-content>{{ attachment.name }}</v-list-item-content>
                                </v-list-item>
                            </v-list> -->
                            <v-list
                                :lines="false"
                                density="compact"
                                class="pa-0"
                            >
                                <v-list-item
                                    v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex"
                                    :value="attachment.name"
                                    color="primary"
                                >
                                    <template #prepend>
                                        <v-icon icon="mdi-file-document-outline"></v-icon>
                                    </template>

                                    <v-list-item-title>{{ attachment.name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                            <v-divider v-if="index < expertises.length-1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>
                        <div><b>Involvements</b></div>
                        <div v-for="(involvement, index) in involvements" :key="index" class="py-5">
                            <h4>
                                <strong>{{ involvement.title }}</strong>
                                <v-icon icon="mdi-circle-small">
                                </v-icon>
                                {{ involvement.yearStart }} - {{ involvement.yearEnd }} 
                            </h4>
                            <p>{{ involvement.desc }}</p>
                            
                            <!-- <v-list dense>
                                <v-list-item v-for="(attachment, attachmentIndex) in expertise.attachments" :key="attachmentIndex">
                                    <v-list-item-content>{{ attachment.name }}</v-list-item-content>
                                </v-list-item>
                            </v-list> -->
                            <v-list
                                :lines="false"
                                density="compact"
                                class="pa-0"
                            >
                                <v-list-item
                                    v-for="(attachment, attachmentIndex) in involvement.attachments" :key="attachmentIndex"
                                    :value="attachment.name"
                                    color="primary"
                                >
                                    <template #prepend>
                                        <v-icon icon="mdi-file-document-outline"></v-icon>
                                    </template>

                                    <v-list-item-title>{{ attachment.name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                            <v-divider v-if="index < involvements.length-1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Involvements -->
        <!-- <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text>
                        <div><b>Involvements</b></div>
                        <v-list dense>
                            <v-list-item v-for="(involvement, index) in involvements" :key="index">
                                <v-list-item-content>{{ involvement }}</v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row> -->

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


export default defineComponent({
    name: "ResearcherLandingPage",
    components: { PublicationTableComponent },
    setup() {
        const router = useRouter();
        const currentRoute = useRoute();

        const person = ref<PersonResponse>();
        const country = ref<Country>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const researcherName = ref("");
        const accountIcon = ref('mdi-account-circle')

        const personalInfo = ref<any>({contact: {}});
        
        const keywords = ref();
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
            if (person.value === undefined) {
                return;
            }

            personalInfo.value = person.value.personalInfo;
                personalInfo.value.streetAndNumber = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.streetAndNumber as MultilingualContent[]);
                personalInfo.value.city = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.city as MultilingualContent[]);

                fetchAndSetCountryInfo();

                // TODO: Improve this!!!
                keywords.value = returnCurrentLocaleContent(person.value.keyword)?.split(",") as string[];

                biography.value = returnCurrentLocaleContent(person.value.biography);
        }

        const fetchAndSetCountryInfo = () => {
            if (country.value !== undefined) {
                personalInfo.value.country = returnCurrentLocaleContent(country.value.name);
                return;
            }

            CountryService.readCountry(person.value?.personalInfo.postalAddress?.countryId as number).then((response) => {
                console.log(response.data)
                country.value = response.data;
                personalInfo.value.country = returnCurrentLocaleContent(response.data.name);
            });
        };

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

        return {researcherName,
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
