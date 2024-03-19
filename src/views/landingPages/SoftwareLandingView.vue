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
                        <div class="edit-pen">
                            <v-btn icon variant="outlined"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

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
        <keyword-list :keywords="keywords" @search-keyword="searchKeyword($event)"></keyword-list>

        <!-- Description -->
        <description-section :description="software?.description"></description-section>

        <person-document-contribution-list :contribution-list="software?.contributions"></person-document-contribution-list>

        <v-row>
            <attachment-list :attachments="software?.fileItems ? software.fileItems : []"></attachment-list>
        </v-row>
        <v-row>
            <attachment-list :attachments="software?.proofs ? software.proofs : []"></attachment-list>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { Software } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';


export default defineComponent({
    name: "SoftwareLandingPage",
    components: { AttachmentList, PersonDocumentContributionList, DescriptionSection },
    setup() {
        const currentRoute = useRoute();
        const router = useRouter();

        const software = ref<Software>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const keywords = ref();

        const i18n = useI18n();

        const icon = ref("mdi-desktop-classic")

        onMounted(() => {
            DocumentPublicationService.readSoftware(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                software.value = response.data;

                software.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                populateData();
            });
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });

            keywords.value = returnCurrentLocaleContent(software.value?.keywords)?.split(",") as string[];
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim() }})        
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
        }

        return {
            software, icon,
            publications, 
            totalPublications,
            returnCurrentLocaleContent,
            languageTagMap, keywords,
            searchKeyword, goToURL
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