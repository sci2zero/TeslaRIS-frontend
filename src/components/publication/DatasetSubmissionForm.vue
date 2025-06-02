<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="publicationYear"
                            type="number"
                            :label="$t('yearOfPublicationLabel') + '*'"
                            :placeholder="$t('yearOfPublicationLabel') + '*'"
                            :rules="requiredFieldRules">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field v-model="datasetNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
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
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
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
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Dataset } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import Toast from '../core/Toast.vue';


export default defineComponent({
    name: "SubmitDataset",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast},
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

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const place = ref([]);
        const contributions = ref([]);
        const publicationYear = ref("");
        const doi = ref("");
        const datasetNumber = ref("");
        const uris = ref<string[]>([]);

        const { requiredFieldRules, doiValidationRules } = useValidationUtils();

        const submitDataset = (stayOnPage: boolean) => {
            const newDataset: Dataset = {
                title: title.value,
                internalNumber: datasetNumber.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createDataset(newDataset).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    datasetNumber.value = "";
                    contributionsRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "datasetLandingPage", params: {id: response.data.id} });
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
            isFormValid, 
            additionalFields,
            snackbar, error,
            title, titleRef,
            subtitle, subtitleRef,
            publicationYear, doi,
            publisherAutocompleteRef,
            selectedPublisher, datasetNumber,
            description, descriptionRef,
            keywords, keywordsRef, errorMessage,
            place, placeRef, uris, urisRef,
            contributions, contributionsRef,
            requiredFieldRules, submitDataset,
            doiValidationRules
        };
    }
});
</script>
