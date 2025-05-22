<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetPatent?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetPatent?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="publicationYear"
                    type="number"
                    :label="$t('yearOfPublicationLabel')"
                    :placeholder="$t('yearOfPublicationLabel')"
                    :rules="requiredFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="patentNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
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
        
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Patent } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';


export default defineComponent({
    name: "PatentUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, Toast},
    props: {
        presetPatent: {
            type: Object as PropType<Patent | undefined>,
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

        const publisher = ref<Publisher>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetPatent?.publisherId) {
                PublisherService.readPublisher(props.presetPatent.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                });
            }
        };

        watch(() => props.presetPatent, () => {
            if (props.presetPatent) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholder = {title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationYear = ref(props.presetPatent?.documentDate);
        const doi = ref(props.presetPatent?.doi);
        const patentNumber = ref(props.presetPatent?.number);
        const uris = ref<string[]>(props.presetPatent?.uris as string[]);

        const { requiredFieldRules, doiValidationRules } = useValidationUtils();

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [{ value: doi.value as string, error: "doiExistsError" }],
                    props.presetPatent?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedPatent: Patent = {
                title: title.value as MultilingualContent[],
                number: patentNumber.value as string,
                description: props.presetPatent?.description as MultilingualContent[],
                keywords: props.presetPatent?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetPatent?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedPatent);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPatent?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetPatent?.subTitle as MultilingualContent[];

            uris.value = props.presetPatent?.uris as string[];
            patentNumber.value = props.presetPatent?.number;
            publicationYear.value = props.presetPatent?.documentDate;
            doi.value = props.presetPatent?.doi;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            fetchDetails();
        };

        return {
            isFormValid,
            title,
            subtitle, doi,
            publicationYear, 
            selectedPublisher, 
            patentNumber, uris, 
            requiredFieldRules,
            submit, message, snackbar,
            toMultilingualTextInput,
            languageTags,
            doiValidationRules,
            titleRef, subtitleRef,
            refreshForm, urisRef
        };
    }
});
</script>
