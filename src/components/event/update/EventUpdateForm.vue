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
                        <multilingual-text-input ref="abbreviationRef" v-model="nameAbbreviation" :label="$t('conferenceAbbreviationLabel')" :initial-value="toMultilingualTextInput(presetEvent?.nameAbbreviation, languageTags)"></multilingual-text-input>
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
                            required
                            :additional-rules="dateRangeRule"
                        ></date-picker>
                    </v-col>
                    <v-col v-if="timePeriodInput" cols="3">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('toLabel') + '*'"
                            color="primary"
                            required
                            :additional-rules="dateRangeRule"
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
                    <v-col>
                        <v-select
                            v-model="selectedCountry"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        ></v-select>
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
                    <v-col cols="10">
                        <v-text-field v-model="openAlexId" label="Open Alex ID" placeholder="Open Alex ID" :rules="sourceOpenAlexIdValidationRules"></v-text-field>
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

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { Country, ExternalValidation, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Conference } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import DatePicker from '@/components/core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import UriInput from '@/components/core/UriInput.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import EventService from '@/services/EventService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';


export default defineComponent({
    name: "EventUpdateForm",
    components: { MultilingualTextInput, DatePicker, UriInput, Toast },
    props: {
        presetEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        inModal: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();
        const i18n = useI18n();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchCountries();
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1}];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });

                setAdditionalInfo();
            });
        };

        watch(i18n.locale, () => {
            fetchCountries();
        });

        const setAdditionalInfo = () => {
            if (props.presetEvent?.countryId) {
                const country = countries.value.find(country => 
                    country.value === props.presetEvent?.countryId
                );
                if (country) {
                    selectedCountry.value = country;
                }
            }
        };

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
        
        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const place = ref<any>([]);
        const conferenceNumber = ref(props.presetEvent?.number);
        const entryFee = ref(props.presetEvent?.fee);
        const serialEvent = ref(props.presetEvent?.serialEvent);
        const confId = ref(props.presetEvent?.confId);
        const openAlexId = ref(props.presetEvent?.openAlexId);
        const uris = ref<string[]>(props.presetEvent?.uris as string[]);

        const {
            requiredFieldRules, confIdValidationRules,
            sourceOpenAlexIdValidationRules
        } = useValidationUtils();

        const dateRangeFormatError = computed(() => i18n.t("dateRangeFormatError"));
        const dateRangeRule = [
            (value: string) => {
                if (!dateFrom.value || !dateTo.value || !value) return true;
                if (dateFrom.value > dateTo.value) return dateRangeFormatError.value;

                return true;
            }
        ];

        const publicationSeriesExternalValidation = ref<ExternalValidation>({ passed: true, message: "" });
        
        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [{ value: confId.value as string, error: "confIdExistsError" }],
                    props.presetEvent?.id as number,
                    (id, docId) => EventService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            if (!timePeriodInput.value) {
                dateFrom.value = new Date(parseInt(eventYear.value as string), 1, 1).toISOString();
                dateTo.value = new Date(parseInt(eventYear.value as string), 11, 31).toISOString();
            }

            const updatedEvent: Conference = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: props.presetEvent?.description as MultilingualContent[],
                keywords: props.presetEvent?.keywords as MultilingualContent[],
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                countryId: selectedCountry.value?.value === -1 ? undefined : selectedCountry.value?.value as number,
                place: place.value,
                serialEvent: serialEvent.value as boolean,
                fee: entryFee.value,
                number: conferenceNumber.value,
                contributions: props.presetEvent?.contributions,
                confId: confId.value,
                openAlexId: openAlexId.value,
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

            setAdditionalInfo();

            uris.value = props.presetEvent?.uris as string[];
            dateFrom.value = props.presetEvent?.dateFrom;
            dateTo.value = props.presetEvent?.dateTo;
            eventYear.value = props.presetEvent?.dateFrom.split("-")[0];
            serialEvent.value = props.presetEvent?.serialEvent;
            conferenceNumber.value = props.presetEvent?.number;
            entryFee.value = props.presetEvent?.fee;
            confId.value = props.presetEvent?.confId;
            openAlexId.value = props.presetEvent?.openAlexId;
            urisRef.value?.refreshModelValue(uris.value);

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
            abbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
        };

        return {
            isFormValid,
            name, nameAbbreviation, urisRef, refreshForm, uris, message, snackbar,
            languageTags, toMultilingualTextInput, placeRef, nameRef, abbreviationRef,
            requiredFieldRules, publicationSeriesExternalValidation, submit, dateRangeRule,
            dateFrom, dateTo, countries, place, conferenceNumber, entryFee, serialEvent,
            eventYear, selectedCountry, timePeriodInput, confIdValidationRules, confId,
            openAlexId, sourceOpenAlexIdValidationRules
        };
    }
});
</script>
