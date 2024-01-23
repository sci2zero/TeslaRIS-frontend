<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="8">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="nameRef" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'" @set-input="name = $event"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="abbreviationRef" :label="$t('nameAbbreviationLabel')" @set-input="nameAbbreviation = $event"></multilingual-text-input>
                    </v-col>
                </v-row>
                <h3>{{ $t("tookPlaceLabel") }}</h3>
                <v-row>
                    <v-col v-if="timePeriodInput" cols="3">
                        <v-text-field v-model="dateFrom" type="date" :label="$t('fromLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col v-if="timePeriodInput" cols="3">
                        <v-text-field v-model="dateTo" type="date" :label="$t('toLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col v-if="!timePeriodInput" cols="6">
                        <v-text-field
                            v-model="eventYear" type="number" :min="1950" :max="2030"
                            :label="$t('eventYearLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-btn color="blue darken-1" compact @click="timePeriodInput = !timePeriodInput">
                            {{ timePeriodInput ? $t("dontKnowExactDateLabel") : $t("rememberedDateLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList" return-object></v-autocomplete>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="placeRef" :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="descriptionRef" :is-area="true" :label="$t('descriptionLabel')" @set-input="description = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" :label="$t('keywordsLabel')" @set-input="keywords = $event"></multilingual-text-input>
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
                    <v-row>
                        <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ $t("savedMessage") }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { countriesSr, countriesEn } from "@/i18n/countries";
import EventService from "@/services/EventService";
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import type { Conference } from '@/models/EventModel';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';

export default defineComponent({
    name: "ConferenceSubmissionForm",
    components: {MultilingualTextInput},
    setup() {
        const isFormValid = ref(false);
        const timePeriodInput = ref(true);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const countryList = computed(() => {
            if (i18n.locale.value === "sr") {
                return countriesSr;
            } else {
                return countriesEn;
            }
        });

        const languageList = ref<LanguageTagResponse[]>();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        })

        const name = ref([]);
        const nameAbbreviation = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const dateFrom = ref();
        const dateTo = ref();
        const eventYear = ref(new Date().getFullYear());
        const state = ref();
        const place = ref([]);
        const conferenceNumber = ref("");
        const entryFee = ref("");
        const serialEvent = ref(false);

        const nameRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const addConference = (stayOnPage: boolean) => {
            if (!timePeriodInput.value) {
                dateFrom.value = new Date(eventYear.value, 1, 1);
                dateTo.value = new Date(eventYear.value, 11, 31);
            }
            let multilingualState: MultilingualContent[] = [];
            if (state.value) {
                languageList.value?.forEach((language: LanguageTagResponse) => {
                    if (language.languageCode === i18n.locale.value.toUpperCase()) {
                        multilingualState = [{content: state.value, languageTag: i18n.locale.value.toUpperCase(), languageTagId: language.id, priority: 1}];
                    }
                });
            }

            const newConference: Conference = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: description.value,
                keywords: keywords.value,
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                state: multilingualState,
                place: place.value,
                serialEvent: serialEvent.value
            }
            EventService.createConference(newConference).then(() => {
                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    abbreviationRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    serialEvent.value = false;
                    entryFee.value = "";
                    conferenceNumber.value = "";
                    dateFrom.value = null;
                    dateTo.value = null;
                    eventYear.value = new Date().getFullYear();
                    state.value = null;
                    timePeriodInput.value = true;

                    error.value = false;
                    snackbar.value = true;
                } else {
                    // TODO: this should redirect to conference landing page
                    router.push({ name: "events" });
                }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {isFormValid, additionalFields, snackbar,
            name, nameAbbreviation, description, keywords,
            dateFrom, dateTo, eventYear, state, countryList,
            place, conferenceNumber, entryFee, serialEvent,
            requiredFieldRules, addConference, timePeriodInput,
            nameRef, abbreviationRef, placeRef, keywordsRef, descriptionRef};
    }
});
</script>
