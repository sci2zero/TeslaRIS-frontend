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
                <div v-if="!serialEvent" class="mt-3">
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
                            <v-btn color="blue darken-1" class="mt-2" compact @click="timePeriodInput = !timePeriodInput">
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
                        <v-select
                            v-model="selectedCountry"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" class="mt-3" @click="additionalFields = !additionalFields">
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
                            <multilingual-text-input ref="descriptionRef" v-model="description" :is-area="true" :label="$t('abstractLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area></multilingual-text-input>
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
import { defineComponent, watch } from 'vue';
import { ref } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { useI18n } from 'vue-i18n';
import EventService from "@/services/EventService";
import type { Country, LanguageTagResponse } from '@/models/Common';
import type { Conference } from '@/models/EventModel';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import DatePicker from '../core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "ConferenceSubmissionForm",
    components: {MultilingualTextInput, DatePicker},
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

        const languageList = ref<LanguageTagResponse[]>();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });

            fetchCountries();
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1}];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });
            });
        };

        watch(i18n.locale, () => {
            fetchCountries();
        });

        const name = ref([]);
        const nameAbbreviation = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const dateFrom = ref();
        const dateTo = ref();
        const eventYear = ref();
        const place = ref([]);
        const confId = ref("");
        const conferenceNumber = ref("");
        const entryFee = ref("");
        const serialEvent = ref(false);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const nameRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const { requiredFieldRules, confIdValidationRules } = useValidationUtils();

        const addConference = (stayOnPage: boolean) => {
            if (!timePeriodInput.value) {
                dateFrom.value = new Date(eventYear.value, 1, 1);
                dateTo.value = new Date(eventYear.value, 11, 31);
            }

            const newConference: Conference = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: description.value,
                keywords: keywords.value,
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                countryId: selectedCountry.value?.value === -1 ? undefined : selectedCountry.value?.value as number,
                place: place.value,
                serialEvent: serialEvent.value,
                fee: entryFee.value,
                number: conferenceNumber.value,
                contributions: [],
                confId: confId.value
            }

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
                    selectedCountry.value = { title: "", value: -1};
                    timePeriodInput.value = true;

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
            dateFrom, dateTo, eventYear, countries, selectedCountry,
            place, conferenceNumber, entryFee, serialEvent,
            requiredFieldRules, addConference, timePeriodInput,
            nameRef, abbreviationRef, placeRef, keywordsRef, descriptionRef,
            confIdValidationRules, confId
        };
    }
});
</script>

<style scoped>

.serial-event {
    margin-left: 10px;
}

</style>
