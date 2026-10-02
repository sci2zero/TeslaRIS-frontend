<template>
    <v-form v-model="isFormInputValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-panorama"
            :title="$t('exhibitionLabel')"
        >
            <multilingual-text-input
                ref="nameRef"
                v-model="name"
                :rules="requiredFieldRules"
                :label="$t('nameLabel') + '*'"
            />
            <multilingual-text-input
                ref="abbreviationRef"
                v-model="nameAbbreviation"
                :label="$t('exhibitionAbbreviationLabel')"
            />
            <div v-if="!serialEvent" class="mt-3 flex flex-col gap-4">
                <p class="text-sm font-semibold text-slate-800">{{ $t("tookPlaceLabel") }}</p>
                <choice-cards
                    :model-value="timePeriodInput ? 'known' : 'unknown'"
                    :options="[
                        { value: 'known', title: $t('knowExactDateLabel'), description: $t('knowExactDateHint') },
                        { value: 'unknown', title: $t('dontKnowExactDateLabel'), description: $t('dontKnowExactDateHint') },
                    ]"
                    @update:model-value="timePeriodInput = $event === 'known'"
                />
                <div v-if="timePeriodInput" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <date-picker
                        ref="fromRef"
                        v-model="dateFrom"
                        :label="$t('fromLabel') + '*'"
                        color="primary"
                        required
                    />
                    <date-picker
                        ref="toRef"
                        v-model="dateTo"
                        :label="$t('toLabel') + '*'"
                        color="primary"
                        required
                    />
                </div>
                <ui-input
                    v-else
                    v-model="eventYear"
                    type="number"
                    :min="1950"
                    :max="2030"
                    :label="$t('eventYearLabel') + '*'"
                    :rules="requiredFieldRules"
                />
                <p v-show="dateRangeError" class="text-sm text-red">
                    {{ dateRangeFormatError }}
                </p>
            </div>
            <ui-checkbox v-if="canAddSerialEvents && !inModal" v-model="serialEvent" :label="$t('serialEventLabel')" />
            <ui-input
                control="select"
                v-model="selectedCountry"
                hide-details="auto"
                :items="countries"
                :label="$t('countryLabel')"
                return-object
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input
                    ref="placeRef"
                    v-model="place"
                    :label="$t('placeLabel')"
                />
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :is-area="true"
                    :label="$t('abstractLabel')"
                />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    :label="$t('keywordsLabel')"
                    is-area
                />
                <ui-input
                    v-if="!serialEvent"
                    v-model="exhibitionNumber"
                    :label="$t('exhibitionNumberLabel')"
                />
                <multilingual-text-input
                    ref="displayOrganizerRef"
                    v-model="displayOrganizer"
                    :label="$t('organizerLabel')"
                />
                <uri-input ref="urisRef" v-model="uris" />
            </template>
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>
    
    <toast v-model="snackbar" :message="$t('savedMessage')" />
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { ref } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { useI18n } from 'vue-i18n';
import EventService from "@/services/EventService";
import type { Country, MultilingualContent } from '@/models/Common';
import type { Exhibition } from '@/models/EventModel';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import DatePicker from '../core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import UriInput from '../core/UriInput.vue';
import Toast from '../core/Toast.vue';
import UiInput from '@/components/ui/input/Input.vue';
import UiCheckbox from '@/components/ui/checkbox/Checkbox.vue';
import ChoiceCards from '@/components/ui/choice-cards/ChoiceCards.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';
import { useUserRole } from '@/composables/useUserRole';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { detectLanguage } from '@/utils/LanguageDetector.js';


export default defineComponent({
    name: "ExhibitionSubmissionForm",
    components: {MultilingualTextInput, DatePicker, UriInput, Toast, UiInput, UiCheckbox, ChoiceCards, FormSection, UiButton},
    props: {
        inModal: {
            type: Boolean,
            default: false
        },
        presetName: {
            type: String,
            default: ""
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormInputValid = ref(false);
        const manualValidationsPassed = ref(false);

        const isFormValid = computed(() => isFormInputValid.value && manualValidationsPassed.value);

        const timePeriodInput = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();

        const { canAddSerialEvents } = useUserRole();

        onMounted(() => {
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

        const { languageTags } = useLanguageTags();
        watch(() => languageTags.value, () => {
            presetName();
        });

        const presetName = async () => {
            if (props.presetName) {
                const detectedLocale = await detectLanguage(props.presetName);
                const tag = languageTags.value.find(
                    lt => lt.languageCode === detectedLocale
                );

                if (tag) {
                    const mc: MultilingualContent[] = [
                        {content: props.presetName, languageTag: tag.languageCode, languageTagId: tag.id, priority: 1}
                    ];
                    name.value = mc;
                    nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(mc, languageTags.value));
                }
            }
        };

        const name = ref<any[]>([]);
        const displayOrganizer = ref<any[]>([]);
        const nameAbbreviation = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const dateFrom = ref();
        const dateTo = ref();
        const eventYear = ref();
        const place = ref([]);
        const exhibitionNumber = ref("");
        const entryFee = ref("");
        const serialEvent = ref(false);
        const uris = ref<string[]>([]);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const nameRef = ref<typeof MultilingualTextInput>();
        const displayOrganizerRef = ref<typeof MultilingualTextInput>();
        const abbreviationRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof MultilingualTextInput>();

        const { requiredFieldRules } = useValidationUtils();

        const dateRangeFormatError = computed(() => i18n.t("dateRangeFormatError"));
        const dateRangeError = ref(false);

        watch([dateFrom, dateTo, eventYear, serialEvent], () => {
            if((eventYear.value && !timePeriodInput.value) || serialEvent.value) {
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
        });

        const submit = (stayOnPage: boolean) => {
            if (!timePeriodInput.value) {
                dateFrom.value = new Date(eventYear.value, 1, 1);
                dateTo.value = new Date(eventYear.value, 11, 31);
            }

            const newExhibition: Exhibition = {
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
                number: exhibitionNumber.value,
                contributions: [],
                uris: uris.value,
                displayOrganizer: displayOrganizer.value
            };

            EventService.createExhibition(newExhibition).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    displayOrganizerRef.value?.clearInput();
                    abbreviationRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    serialEvent.value = false;
                    entryFee.value = "";
                    exhibitionNumber.value = "";
                    dateFrom.value = null;
                    dateTo.value = null;
                    eventYear.value = null;
                    selectedCountry.value = { title: "", value: -1};
                    timePeriodInput.value = true;
                    urisRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "exhibitionLandingPage", params: {id: response.data.id} });
                }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid, isFormInputValid, additionalFields, snackbar,
            name, nameAbbreviation, description, keywords,
            dateFrom, dateTo, eventYear, countries, selectedCountry,
            place, exhibitionNumber, entryFee, serialEvent,
            requiredFieldRules, submit, timePeriodInput, dateRangeFormatError,
            nameRef, abbreviationRef, placeRef, keywordsRef, descriptionRef,
            uris, urisRef, canAddSerialEvents, dateRangeError,
            manualValidationsPassed, displayOrganizer, displayOrganizerRef
        };
    }
});
</script>

<style scoped>

.serial-event {
    margin-left: 10px;
}

</style>
