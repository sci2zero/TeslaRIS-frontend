<template>
    <v-form v-model="isFormInputValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="nameRef"
                            v-model="name"
                            :rules="requiredFieldRules"
                            :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetEvent?.name, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="abbreviationRef"
                            v-model="nameAbbreviation"
                            :label="$t('nameAbbreviationLabel')"
                            :initial-value="toMultilingualTextInput(presetEvent?.nameAbbreviation, languageTags)"
                        />
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
                <p v-show="dateRangeError" class="mb-2 text-red">
                    {{ dateRangeFormatError }}
                </p>
                <v-row v-if="!inComparator" class="mt-2">
                    <v-checkbox v-model="serialEvent" :label="$t('serialEventLabel')"></v-checkbox>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedCountry"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="placeRef"
                            v-model="place"
                            :label="$t('placeLabel')"
                            :initial-value="toMultilingualTextInput(presetEvent?.place, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field
                            v-model="courseLevel"
                            :label="$t('courseLevelLabel')"
                        />
                    </v-col>
                    <v-col cols="5">
                        <v-text-field
                            v-model="courseCode"
                            :label="$t('courseCodeLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row v-if="!serialEvent">
                    <v-col cols="3">
                        <v-text-field
                            v-model="numberOfCredits"
                            :label="$t('numberOfCreditsLabel')"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-text-field
                            v-model="academicYear"
                            :label="$t('academicYearLabel')"
                        />
                    </v-col>
                    <v-col cols="3">
                        <v-text-field
                            v-model="numberOfStudents"
                            type="number"
                            :label="$t('numberOfStudentsLabel')"
                            :placeholder="$t('numberOfStudentsLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row v-if="!serialEvent">
                    <v-col>
                        <multilingual-text-input
                            ref="groupNameRef"
                            v-model="groupName"
                            :label="$t('groupNameLabel')"
                            :initial-value="toMultilingualTextInput(presetEvent?.groupName, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="displayOrganizerRef"
                            v-model="displayOrganizer"
                            :label="$t('organizerLabel')"
                            :initial-value="toMultilingualTextInput(presetEvent?.displayOrganizer, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input
                            ref="urisRef"
                            v-model="uris"
                        />
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
import type { Course } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import DatePicker from '@/components/core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import UriInput from '@/components/core/UriInput.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';


export default defineComponent({
    name: "CourseUpdateForm",
    components: { MultilingualTextInput, DatePicker, UriInput, Toast },
    props: {
        presetEvent: {
            type: Object as PropType<Course | undefined>,
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
        const isFormInputValid = ref(false);
        const manualValidationsPassed = ref(false);

        const isFormValid = computed(() => isFormInputValid.value && manualValidationsPassed.value);

        const { message, snackbar } = useIdentifierCheck();
        const i18n = useI18n();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchCountries();
            validateEventPeriod();
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
        const displayOrganizerRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const groupNameRef = ref<typeof MultilingualTextInput>();

        const name = ref<any[]>([]);
        const displayOrganizer = ref<any[]>([]);
        const nameAbbreviation = ref<any[]>([]);

        const dateFrom = ref(props.presetEvent?.dateFrom);
        const dateTo = ref(props.presetEvent?.dateTo);
        const eventYear = ref(props.presetEvent?.dateFrom.split("-")[0]);
        const timePeriodInput = ref(!((new Date(dateTo.value as string).getTime() - new Date(dateFrom.value as string).getTime()) > (30 * 24 * 60 * 60 * 1000)));
        
        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const place = ref<any>([]);
        const groupName = ref<any>([]);
        const courseLevel = ref(props.presetEvent?.courseLevel);
        const courseCode = ref(props.presetEvent?.courseCode);
        const numberOfCredits = ref(props.presetEvent?.numberOfCredits);
        const numberOfStudents = ref(props.presetEvent?.numberOfStudents);
        const academicYear = ref(props.presetEvent?.academicYear);
        const serialEvent = ref(props.presetEvent?.serialEvent);
        const uris = ref<string[]>(props.presetEvent?.uris as string[]);

        const {
            requiredFieldRules, confIdValidationRules,
            sourceOpenAlexIdValidationRules
        } = useValidationUtils();

        const dateRangeFormatError = computed(() => i18n.t("dateRangeFormatError"));
        const dateRangeError = ref(false);
        watch([dateFrom, dateTo, eventYear], () => {
            validateEventPeriod();
        });

        const validateEventPeriod = () => {
            if(eventYear.value && !timePeriodInput.value) {
                dateRangeError.value = false;
                manualValidationsPassed.value = true;
                return;
            }

            const from = dateFrom.value;
            const to = dateTo.value;

            if (!from || !to) {
                dateRangeError.value = false;
                return;
            }

            if (from > to) {
                dateRangeError.value = true;
                manualValidationsPassed.value = false;
                return;
            }

            dateRangeError.value = false;
            manualValidationsPassed.value = true;
        };

        const publicationSeriesExternalValidation = ref<ExternalValidation>({ passed: true, message: "" });
        
        const submit = async () => {
            // if (props.inModal) {
            //     const { duplicateFound } = await checkIdentifiers(
            //         [{ value: confId.value as string, error: "confIdExistsError" }],
            //         props.presetEvent?.id as number,
            //         (id, docId) => EventService.checkIdentifierUsage(id, docId)
            //     );

            //     if (duplicateFound) {
            //         return;
            //     }
            // }

            if (!timePeriodInput.value) {
                dateFrom.value = new Date(parseInt(eventYear.value as string), 1, 1).toISOString();
                dateTo.value = new Date(parseInt(eventYear.value as string), 11, 31).toISOString();
            }

            const updatedEvent: Course = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: props.presetEvent?.description as MultilingualContent[],
                keywords: props.presetEvent?.keywords as MultilingualContent[],
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                countryId: selectedCountry.value?.value === -1 ? undefined : selectedCountry.value?.value as number,
                place: place.value,
                serialEvent: serialEvent.value as boolean,
                courseLevel: courseLevel.value,
                courseCode: courseCode.value,
                academicYear: academicYear.value,
                numberOfCredits: numberOfCredits.value,
                numberOfStudents: numberOfStudents.value,
                groupName: groupName.value,
                contributions: props.presetEvent?.contributions,
                uris: uris.value,
                displayOrganizer: displayOrganizer.value
            }

            emit("update", updatedEvent);
        };

        const refreshForm = () => {
            nameRef.value?.clearInput();
            name.value = props.presetEvent?.name as MultilingualContent[];

            displayOrganizerRef.value?.clearInput();
            displayOrganizer.value = props.presetEvent?.displayOrganizer as MultilingualContent[];

            abbreviationRef.value?.clearInput();
            nameAbbreviation.value = props.presetEvent?.nameAbbreviation as MultilingualContent[];

            placeRef.value?.clearInput();
            place.value = props.presetEvent?.place as MultilingualContent[];

            groupNameRef.value?.clearInput();
            groupName.value = props.presetEvent?.groupName as MultilingualContent[];

            setAdditionalInfo();

            uris.value = props.presetEvent?.uris as string[];
            dateFrom.value = props.presetEvent?.dateFrom;
            dateTo.value = props.presetEvent?.dateTo;
            eventYear.value = props.presetEvent?.dateFrom.split("-")[0];
            serialEvent.value = props.presetEvent?.serialEvent;
            courseLevel.value = props.presetEvent?.courseLevel;
            courseCode.value = props.presetEvent?.courseCode;
            academicYear.value = props.presetEvent?.academicYear;
            numberOfCredits.value = props.presetEvent?.numberOfCredits;
            numberOfStudents.value = props.presetEvent?.numberOfStudents;
            urisRef.value?.refreshModelValue(uris.value);

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
            abbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
            displayOrganizerRef.value?.forceRefreshModelValue(toMultilingualTextInput(displayOrganizer.value, languageTags.value));
            groupNameRef.value?.forceRefreshModelValue(toMultilingualTextInput(groupName.value, languageTags.value));
        };

        return {
            isFormInputValid, isFormValid, dateRangeError, name, nameAbbreviation,
            urisRef, refreshForm, uris, message, snackbar, languageTags, 
            toMultilingualTextInput, placeRef, nameRef, abbreviationRef,
            requiredFieldRules, publicationSeriesExternalValidation, submit,
            dateFrom, dateTo, countries, place, groupName, groupNameRef, serialEvent,
            eventYear, selectedCountry, timePeriodInput, confIdValidationRules,
            sourceOpenAlexIdValidationRules, dateRangeFormatError,
            displayOrganizer, displayOrganizerRef, courseLevel, courseCode,
            academicYear, numberOfCredits, numberOfStudents
        };
    }
});
</script>
