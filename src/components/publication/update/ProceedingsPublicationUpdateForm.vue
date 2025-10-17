<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="11">
                <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required></event-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedProceedings"
                    :items="availableProceedings"
                    :label="$t('proceedingsLabel') + '*'"
                    :no-data-text="selectedEvent.value === -1 ? $t('selectConferenceMessage') : $t('noAvailableProceedingsMessage')"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
            <v-col class="proceedings-submission">
                <generic-crud-modal
                    :form-component="ProceedingsSubmissionForm"
                    :form-props="{conference: selectedEvent}"
                    entity-name="Proceedings"
                    is-submission
                    :read-only="false"
                    @create="selectNewlyAddedProceedings"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetProceedingsPublication?.title, languageTags)"></multilingual-text-input>
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
                    :label="$t('concretePublicationTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetProceedingsPublication?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <v-text-field v-model="articleNumber" :label="$t('articleNumberLabel')" :placeholder="$t('articleNumberLabel')"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="numberOfPages" type="number"
                    :min="0" :label="$t('numberOfPagesLabel')"
                    :rules="optionalNumericZeroOrGreaterFieldRules"
                    :placeholder="$t('numberOfPagesLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris"></uri-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-text-field
                    v-model="scopus"
                    label="Scopus ID"
                    placeholder="Scopus ID"
                    :rules="scopusIdValidationRules">
                </v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="openAlexId"
                    label="Open Alex ID"
                    placeholder="Open Alex ID"
                    :rules="workOpenAlexIdValidationRules">
                </v-text-field>
            </v-col>
            <v-col cols="3">
                <v-text-field
                    v-model="webOfScienceId"
                    label="Web of Science ID"
                    placeholder="Web of Science ID"
                    :rules="documentWebOfScienceIdValidationRules">
                </v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { ProceedingsPublication, ProceedingsPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { Conference } from '@/models/EventModel';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/proceedingsPublicationType';
import { useI18n } from 'vue-i18n';
import EventService from '@/services/EventService';
import type { Proceedings, ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import ProceedingsSubmissionForm from '@/components/proceedings/ProceedingsSubmissionForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';


export default defineComponent({
    name: "ProceedingsPublicationUpdateForm",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, GenericCrudModal, Toast},
    props: {
        presetProceedingsPublication: {
            type: Object as PropType<ProceedingsPublication | undefined>,
            required: true
        },
        inModal: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const proceedings = ref<Proceedings>();
        const event = ref<Conference>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetProceedingsPublication?.eventId && props.presetProceedingsPublication?.proceedingsId) {
                EventService.readConference(props.presetProceedingsPublication.eventId).then((response) => {
                    event.value = response.data;
                    selectedEvent.value = {title: returnCurrentLocaleContent(event.value.name) as string, value: event.value.id as number};

                    fetchProceedings(selectedEvent.value);
                });

                ProceedingsService.readProceedings(props.presetProceedingsPublication.proceedingsId).then((response) => {
                    proceedings.value = response.data;
                    selectedProceedings.value = {title: returnCurrentLocaleContent(proceedings.value.title) as string, value: proceedings.value.id as number};
                });
            }
        };

        watch(() => props.presetProceedingsPublication, () => {
            if (props.presetProceedingsPublication) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholderProceedings = {title: returnCurrentLocaleContent(proceedings.value?.title) as string, value: proceedings.value?.id as number};
        const selectedProceedings = ref<{ title: string, value: number }>(searchPlaceholderProceedings);

        const searchPlaceholderEvent = {title: returnCurrentLocaleContent(event.value?.name) as string, value: event.value?.id as number};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholderEvent);

        watch(selectedEvent, () => {
            if (selectedEvent.value.value !== props.presetProceedingsPublication?.eventId) {
                selectedProceedings.value = searchPlaceholderProceedings;
                fetchProceedings(selectedEvent.value);
            }
        });

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const startPage = ref(props.presetProceedingsPublication?.startPage);
        const endPage = ref(props.presetProceedingsPublication?.endPage);
        const publicationYear = ref(props.presetProceedingsPublication?.documentDate);
        const doi = ref(props.presetProceedingsPublication?.doi);
        const scopus = ref(props.presetProceedingsPublication?.scopusId);
        const openAlexId = ref(props.presetProceedingsPublication?.openAlexId);
        const webOfScienceId = ref(props.presetProceedingsPublication?.openAlexId);
        const articleNumber = ref(props.presetProceedingsPublication?.articleNumber);
        const numberOfPages = ref(props.presetProceedingsPublication?.numberOfPages);
        const uris = ref<string[]>(props.presetProceedingsPublication?.uris as string[]);

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        } = useValidationUtils();
        
        const i18n = useI18n();
        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType | null }>({title: props.presetProceedingsPublication?.proceedingsPublicationType ? getTitleFromValueAutoLocale(props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType) as string : "", value: props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType});

        const selectNewlyAddedProceedings = (proceedings: Proceedings) => {
            let title: string | undefined;
            proceedings.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && proceedings.title.length > 0) {
                title = proceedings.title[0].content;
            }
            const toSelect = {title: `${title} | ${proceedings.documentDate}`, value: proceedings.id as number};
            availableProceedings.value.push(toSelect);
            selectedProceedings.value = toSelect;
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            availableProceedings.value.splice(0);
            ProceedingsService.readProceedingsForEvent(event.value).then((response) => {
                response.data.forEach((proceedingsResponse: ProceedingsResponse) => {
                    let title: string | undefined;
                    proceedingsResponse.title.forEach(multilingualContent => {
                        if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                            title = multilingualContent.content;
                            return;
                        }
                    });
                    if (!title && proceedingsResponse.title.length > 0) {
                        title = proceedingsResponse.title[0].content;
                    }

                    availableProceedings.value.push({title: `${title} | ${proceedingsResponse.documentDate}`, value: proceedingsResponse.id as number })
                });
            });
        };

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [
                        { value: doi.value as string, error: "doiExistsError" },
                        { value: scopus.value as string, error: "scopusIdExistsError"},
                        { value: openAlexId.value as string, error: "openAlexIdExistsError"},
                        { value: webOfScienceId.value as string, error: "webOfScienceIdExistsError"}
                    ],
                    props.presetProceedingsPublication?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedProceedingsPublication: ProceedingsPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetProceedingsPublication?.description as MultilingualContent[],
                keywords: props.presetProceedingsPublication?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetProceedingsPublication?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                eventId: selectedEvent.value.value,
                proceedingsPublicationType: selectedpublicationType.value.value as ProceedingsPublicationType,
                proceedingsId: selectedProceedings.value.value,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedProceedingsPublication);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetProceedingsPublication?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetProceedingsPublication?.subTitle as MultilingualContent[];

            uris.value = props.presetProceedingsPublication?.uris as string[];
            startPage.value = props.presetProceedingsPublication?.startPage;
            endPage.value = props.presetProceedingsPublication?.endPage;
            numberOfPages.value = props.presetProceedingsPublication?.numberOfPages;
            publicationYear.value = props.presetProceedingsPublication?.documentDate;
            doi.value = props.presetProceedingsPublication?.doi;
            scopus.value = props.presetProceedingsPublication?.scopusId;
            openAlexId.value = props.presetProceedingsPublication?.openAlexId;
            webOfScienceId.value = props.presetProceedingsPublication?.webOfScienceId;
            articleNumber.value = props.presetProceedingsPublication?.articleNumber;
            selectedpublicationType.value = {title: props.presetProceedingsPublication?.proceedingsPublicationType ? getTitleFromValueAutoLocale(props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType) as string : "", value: props.presetProceedingsPublication?.proceedingsPublicationType ? props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType : null};

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            fetchDetails();
        };

        return {
            isFormValid, title, subtitle,
            publicationYear, doi, scopus,
            selectedProceedings, articleNumber,
            uris, numberOfPages, doiValidationRules, openAlexId,
            requiredFieldRules, selectedEvent, titleRef, subtitleRef,
            submit, toMultilingualTextInput, snackbar, message,
            languageTags, startPage, endPage, requiredSelectionRules,
            publicationTypes, selectedpublicationType, availableProceedings,
            selectNewlyAddedProceedings, scopusIdValidationRules,
            refreshForm, urisRef, ProceedingsSubmissionForm,
            workOpenAlexIdValidationRules, webOfScienceId,
            documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        };
    }
});
</script>

<style scoped>

.proceedings-submission {
    margin-top: 15px;
}

</style>
