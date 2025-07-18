<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="10">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.SOFTWARE"
                            @metadata-fetched="popuateMetadata"
                        />
                    </v-col>
                </v-row>
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
                        <v-text-field
                            v-model="softwareNumber"
                            :label="$t('internalNumberLabel')"
                            :placeholder="$t('internalNumberLabel')">
                        </v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field
                            v-model="openAlexId"
                            label="Open Alex ID"
                            placeholder="Open Alex ID"
                            :rules="workOpenAlexIdValidationRules">
                        </v-text-field>
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
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { PublicationType, type PersonDocumentContribution, type Software } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';


export default defineComponent({
    name: "SubmitSoftware",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast, IDFMetadataPrepopulator},
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

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const router = useRouter();

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const publicationYear = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const softwareNumber = ref("");
        const uris = ref<string[]>([]);

        const {
            requiredFieldRules, doiValidationRules,
            workOpenAlexIdValidationRules
        } = useValidationUtils();

        const submitSoftware = (stayOnPage: boolean) => {
            const newSoftware: Software = {
                title: title.value,
                internalNumber: softwareNumber.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createSoftware(newSoftware).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    softwareNumber.value = "";
                    contributionsRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "softwareLandingPage", params: {id: response.data.id} });
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

        const { languageTags } = useLanguageTags();
        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }

            softwareNumber.value = softwareNumber.value ? softwareNumber.value : metadata.issue;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (contributions.value.length === 0) {
                contributions.value = metadata.contributions;
                contributionsRef.value?.fillDummyAuthors(contributions.value.length);

                await nextTick();

                contributionsRef.value?.fillInputs(contributions.value, true);
            }
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, error,
            title, titleRef,
            subtitle, subtitleRef,
            publicationYear, doi, PublicationType,
            publisherAutocompleteRef, popuateMetadata,
            selectedPublisher, softwareNumber, openAlexId,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef,
            contributions, contributionsRef, errorMessage,
            requiredFieldRules, submitSoftware,
            workOpenAlexIdValidationRules
        };
    }
});
</script>
