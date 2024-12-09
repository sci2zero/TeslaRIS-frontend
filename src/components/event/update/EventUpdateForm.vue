<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetEvent?.name, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="abbreviationRef" v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :initial-value="toMultilingualTextInput(presetEvent?.nameAbbreviation, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <h3 v-if="!serialEvent">
                    {{ $t("tookPlaceLabel") }}
                </h3>
                <v-row v-if="!serialEvent">
                    <v-col v-if="timePeriodInput" cols="3">
                        <date-picker
                            v-model="dateFrom"
                            :label="$t('fromLabel') + '*'"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col v-if="timePeriodInput" cols="3">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('toLabel') + '*'"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col v-if="!timePeriodInput" cols="6">
                        <v-text-field
                            v-model="eventYear" type="number" :min="1950" :max="2030"
                            :label="$t('eventYearLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-btn color="blue darken-1" compact @click="timePeriodInput = !timePeriodInput">
                            {{ timePeriodInput ? $t("dontKnowExactDateLabel") : $t("knowExactDateLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList" return-object></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')" :initial-value="toMultilingualTextInput(presetEvent?.place, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field v-model="confId" label="Conf ID" placeholder="Conf ID" :rules="confIdValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field
                            v-model="conferenceNumber"
                            :label="$t('conferenceNumberLabel')"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field
                            v-model="entryFee"
                            :label="$t('entryFeeLabel')"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="!inComparator">
                    <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris"></uri-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { ExternalValidation, LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Conference } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { getCountriesForGivenLocale, countriesSr, countriesEn } from '@/i18n/countries';
import DatePicker from '@/components/core/DatePicker.vue';
import UriInput from '@/components/core/UriInput.vue';


export default defineComponent({
    name: "EventUpdateForm",
    components: { MultilingualTextInput, DatePicker, UriInput },
    props: {
        presetEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const i18n = useI18n();

        const languageTags = ref<LanguageTagResponse[]>([]);

        const countryList = getCountriesForGivenLocale();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        watch(() => props.presetEvent, () => {
            if (props.presetEvent) {
                refreshForm();
            }
        });

        const urisRef = ref<typeof MultilingualTextInput>();
        const nameRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref<any>([]);
        const nameAbbreviation = ref<any>([]);

        const dateFrom = ref(props.presetEvent?.dateFrom);
        const dateTo = ref(props.presetEvent?.dateTo);
        const eventYear = ref(props.presetEvent?.dateFrom.split("-")[0]);
        const timePeriodInput = ref(!((new Date(dateTo.value as string).getTime() - new Date(dateFrom.value as string).getTime()) > (30 * 24 * 60 * 60 * 1000)));
        
        const state = ref(returnCurrentLocaleContent(props.presetEvent?.state));
        const place = ref<any>([]);
        const conferenceNumber = ref(props.presetEvent?.number);
        const entryFee = ref(props.presetEvent?.fee);
        const serialEvent = ref(props.presetEvent?.serialEvent);
        const confId = ref(props.presetEvent?.confId);
        const uris = ref<string[]>(props.presetEvent?.uris as string[]);

        const { requiredFieldRules, confIdValidationRules } = useValidationUtils();

        const publicationSeriesExternalValidation = ref<ExternalValidation>({ passed: true, message: "" });
        
        const updateEvent = () => {
            if (!timePeriodInput.value) {
                dateFrom.value = new Date(parseInt(eventYear.value as string), 1, 1).toISOString();
                dateTo.value = new Date(parseInt(eventYear.value as string), 11, 31).toISOString();
            }
            
            const multilingualState: MultilingualContent[] = [];
            if (state.value) {
                let stateContentIndex = -1;
                if (i18n.locale.value === "en") {
                    stateContentIndex = countriesEn.findIndex(obj => obj === state.value);
                } else {
                    stateContentIndex = countriesSr.findIndex(obj => obj === state.value);
                }

                languageTags.value?.forEach((language: LanguageTagResponse) => {
                    let content = "";
                    switch (language.languageCode) {
                        case "SR":
                            content = countriesSr[stateContentIndex];
                            multilingualState.push({content: content, languageTag: language.languageCode, languageTagId: language.id, priority: 1});
                            break;
                        case "EN":
                            content = countriesEn[stateContentIndex];
                            multilingualState.push({content: content, languageTag: language.languageCode, languageTagId: language.id, priority: 2});
                            break;
                    }
                });
            }

            const updatedEvent: Conference = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: props.presetEvent?.description as MultilingualContent[],
                keywords: props.presetEvent?.keywords as MultilingualContent[],
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                state: multilingualState,
                place: place.value,
                serialEvent: serialEvent.value as boolean,
                fee: entryFee.value,
                number: conferenceNumber.value,
                contributions: props.presetEvent?.contributions,
                confId: confId.value,
                uris: uris.value
            }

            emit("update", updatedEvent);
        };

        const refreshForm = () => {
            nameRef.value?.clearInput();
            name.value = props.presetEvent?.name as MultilingualContent[];

            abbreviationRef.value?.clearInput();
            nameAbbreviation.value = props.presetEvent?.nameAbbreviation as MultilingualContent[];

            placeRef.value?.clearInput();
            place.value = props.presetEvent?.place as MultilingualContent[];

            state.value = returnCurrentLocaleContent(props.presetEvent?.state);

            uris.value = props.presetEvent?.uris as string[];
            dateFrom.value = props.presetEvent?.dateFrom;
            dateTo.value = props.presetEvent?.dateTo;
            eventYear.value = props.presetEvent?.dateFrom.split("-")[0];
            serialEvent.value = props.presetEvent?.serialEvent;
            conferenceNumber.value = props.presetEvent?.number;
            entryFee.value = props.presetEvent?.fee;
            confId.value = props.presetEvent?.confId;
            urisRef.value?.refreshModelValue(uris.value);

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
            abbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
        };

        return {
            isFormValid,
            name, nameAbbreviation, urisRef, refreshForm, uris,
            languageTags, toMultilingualTextInput, placeRef, nameRef, abbreviationRef,
            requiredFieldRules, publicationSeriesExternalValidation, updateEvent,
            dateFrom, dateTo, state, place, conferenceNumber, entryFee, serialEvent,
            eventYear, countryList, timePeriodInput, confIdValidationRules, confId
        };
    }
});
</script>
