<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="11">
                        <monograph-autocomplete-search ref="eventAutocompleteRef" v-model="selectedMonograph" required></monograph-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row v-if="selectedMonograph && selectedMonograph.value != -1 && myPublications.length > 0">
                    <v-col>
                        <h3>{{ $t("recentPublicationsLabel") }}</h3>
                        <p
                            v-for="(publicationIndex, i) in myPublications"
                            :key="i"
                            :value="publicationIndex"
                        >
                            {{ $i18n.locale === "sr" ? publicationIndex.titleSr : publicationIndex.titleOther }}
                        </p>
                    </v-col>
                </v-row>
                <v-row v-if="selectedMonograph && selectedMonograph.value != -1 && myPublications.length == 0 && isResearcher">
                    <v-col><h3>{{ $t("noRecentPublicationsMonographLabel") }}</h3></v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field v-model="startPage" :label="$t('startPageLabel')" :placeholder="$t('startPageLabel')"></v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field v-model="endPage" :label="$t('endPageLabel')" :placeholder="$t('endPageLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedpublicationType"
                            :items="publicationTypes"
                            :label="$t('typeOfPublicationLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution ref="contributionsRef" basic @set-input="contributions = $event"></person-publication-contribution>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID" :rules="scopusIdValidationRules"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="5">
                            <v-text-field v-model="articleNumber" :label="$t('articleNumberLabel')" :placeholder="$t('articleNumberLabel')"></v-text-field>
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                v-model="numberOfPages" type="number" :min="0" :label="$t('numberOfPagesLabel')"
                                :placeholder="$t('numberOfPagesLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris"></uri-input>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    
    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { DocumentPublicationIndex, MonographPublicationType } from "@/models/PublicationModel";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { MonographPublication } from "@/models/PublicationModel";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { monographPublicationTypeSr, monographPublicationTypeEn } from "@/i18n/monographPublicationType";
import type { ErrorResponse } from '@/models/Common';
import type { AxiosError } from 'axios';
import MonographAutocompleteSearch from './MonographAutocompleteSearch.vue';
import Toast from '../core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "SubmitMonographPublication",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, MonographAutocompleteSearch, Toast },
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();

        const monographAutocompleteRef = ref<typeof MonographAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};

        const myPublications = ref<DocumentPublicationIndex[]>([]);

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref([]);
        const availableMonograph = ref<{title: string, value: number}[]>([]);
        const selectedMonograph = ref(searchPlaceholder);
        const startPage = ref("");
        const endPage = ref("");
        const doi = ref("");
        const scopus = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const uris = ref<string[]>([]);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const { requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const publicationTypes = computed((): { title: string, value: MonographPublicationType | null }[] => i18n.locale.value === "sr" ? monographPublicationTypeSr : monographPublicationTypeEn);
        const selectedpublicationType = ref<{ title: string, value: MonographPublicationType | null }>({title: "", value: null});

        const listPublications = (monograph: { title: string, value: number }) => {
            if (monograph.value > 0) {
                DocumentPublicationService.findMyPublicationsInMonograph(monograph.value).then((response) => {
                myPublications.value = response.data;
            });
            }
        };

        const { isResearcher } = useUserRole();

        watch(selectedMonograph, (newValue) => {
            if (newValue && isResearcher.value) {
                listPublications(newValue);
            }
        });

        const submitMonographPublication = (stayOnPage: boolean) => {
            const newMonographPublication: MonographPublication = {
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                monographId: selectedMonograph.value.value,
                monographPublicationType: selectedpublicationType.value.value as MonographPublicationType,
                startPage: startPage.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: contributions.value,
                doi: doi.value,
                scopusId: scopus.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createMonographPublication(newMonographPublication).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    monographAutocompleteRef.value?.clearInput();
                    availableMonograph.value = [];
                    selectedMonograph.value = searchPlaceholder;
                    selectedpublicationType.value = {title: "", value: null};
                    startPage.value = "";
                    endPage.value = "";
                    doi.value = "";
                    scopus.value = "";
                    articleNumber.value = "";
                    numberOfPages.value = null;
                    contributionsRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "monographPublicationLandingPage", params: {id: response.data.id} });
                }
            }).catch((axiosError: AxiosError<ErrorResponse>) => {
                const message = i18n.t(axiosError.response?.data.message as string);
                if (message !== axiosError.response?.data.message) {
                    errorMessage.value = message;
                } else {
                    errorMessage.value = i18n.t("genericErrorMessage");
                }
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid, additionalFields,
            snackbar, error, title, titleRef,
            subtitle, subtitleRef, startPage, endPage,
            doi, scopus, articleNumber, numberOfPages,
            description, descriptionRef, keywords, keywordsRef,
            uris, urisRef, myPublications, doiValidationRules,
            selectedMonograph, monographAutocompleteRef, listPublications,
            publicationTypes, selectedpublicationType, isResearcher,
            contributions, contributionsRef, scopusIdValidationRules,
            requiredFieldRules, requiredSelectionRules, submitMonographPublication,
            availableMonograph, errorMessage
        };
    }
});
</script>


<style scoped>

.monograph-submission {
    margin-top: 15px;
}

</style>
