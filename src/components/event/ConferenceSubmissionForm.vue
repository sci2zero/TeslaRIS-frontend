<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="abbreviationRef" v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <div v-if="!serialEvent">
                    <h3>{{ $t("tookPlaceLabel") }}</h3>
                    <v-row>
                        <v-col v-if="timePeriodInput" cols="3">
                            <date-picker
                                v-model="dateFrom"
                                :label="$t('fromLabel') + '*'"
                                color="primary"
                                required
                            ></date-picker>
                        </v-col>
                        <v-col v-if="timePeriodInput" cols="3">
                            <date-picker
                                v-model="dateTo"
                                :label="$t('toLabel') + '*'"
                                color="primary"
                                required
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
                </div>
                <v-row class="serial-event">
                    <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
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
                            <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="descriptionRef" v-model="description" :is-area="true" :label="$t('descriptionLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
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
import { useValidationUtils } from '@/utils/ValidationUtils';
import DatePicker from '../core/DatePicker.vue';
import UriInput from '../core/UriInput.vue';


export default defineComponent({
    name: "ConferenceSubmissionForm",
    components: { MultilingualTextInput, DatePicker, UriInput },
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const timePeriodInput = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();

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
        const eventYear = ref();
        const state = ref();
        const place = ref([]);
        const confId = ref("");
        const conferenceNumber = ref("");
        const entryFee = ref("");
        const serialEvent = ref(false);
        const uris = ref<string[]>([]);

        const nameRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof MultilingualTextInput>();

        const { requiredFieldRules, confIdValidationRules } = useValidationUtils();

        const addConference = (stayOnPage: boolean) => {
            if (!timePeriodInput.value) {
                dateFrom.value = new Date(eventYear.value, 1, 1);
                dateTo.value = new Date(eventYear.value, 11, 31);
            }
            
            const multilingualState: MultilingualContent[] = [];
            if (state.value) {
                let stateContentIndex = -1;
                if (i18n.locale.value === "en") {
                    stateContentIndex = countriesEn.findIndex(obj => obj === state.value);
                } else {
                    stateContentIndex = countriesSr.findIndex(obj => obj === state.value);
                }

                languageList.value?.forEach((language: LanguageTagResponse) => {
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

            const newConference: Conference = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: description.value,
                keywords: keywords.value,
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                state: multilingualState,
                place: place.value,
                serialEvent: serialEvent.value,
                fee: entryFee.value,
                number: conferenceNumber.value,
                contributions: [],
                confId: confId.value,
                uris: uris.value
            };

            EventService.createConference(newConference).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    abbreviationRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    serialEvent.value = false;
                    entryFee.value = "";
                    conferenceNumber.value = "";
                    confId.value = "";
                    dateFrom.value = null;
                    dateTo.value = null;
                    eventYear.value = null;
                    state.value = null;
                    timePeriodInput.value = true;
                    urisRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "conferenceLandingPage", params: {id: response.data.id} });
                }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid, additionalFields, snackbar,
            name, nameAbbreviation, description, keywords,
            dateFrom, dateTo, eventYear, state, countryList,
            place, conferenceNumber, entryFee, serialEvent,
            requiredFieldRules, addConference, timePeriodInput,
            nameRef, abbreviationRef, placeRef, keywordsRef, descriptionRef,
            confIdValidationRules, confId, uris, urisRef
        };
    }
});
</script>

<style scoped>

.serial-event {
    margin-left: 10px;
}

</style>
