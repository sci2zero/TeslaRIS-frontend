<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetPublisher?.name, languageTags)"></multilingual-text-input>
                    </v-col>
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
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')" :initial-value="toMultilingualTextInput(presetPublisher?.place, languageTags)"></multilingual-text-input>
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
import type { Country } from '@/models/Common';
import { onMounted } from 'vue';
import type { AxiosResponse } from 'axios';
import type { Publisher } from "@/models/PublisherModel";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import CountryService from '@/services/CountryService';
import { useI18n } from 'vue-i18n';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "PublisherUpdateForm",
    components: {MultilingualTextInput},
    props: {
        presetPublisher: {
            type: Object as PropType<Publisher | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

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

                if (props.presetPublisher?.countryId) {
                    const country = countries.value.find(country => 
                        country.value === props.presetPublisher?.countryId
                    );

                    if (country) {
                        selectedCountry.value = country;
                    }
                }
            });
        };

        watch(i18n.locale, () => {
            fetchCountries();
        });

        watch(() => props.presetPublisher, () => {
            if (props.presetPublisher) {
                refreshForm();
            }
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref([]);
        const place = ref([]);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const updatedPublisher: Publisher = {
                name: name.value,
                countryId: selectedCountry.value?.value === -1 ? undefined : selectedCountry.value?.value as number,
                place: place.value
            };

            emit("update", updatedPublisher);
        };

        const refreshForm = () => {
            const country = countries.value.find(country => 
                country.value === props.presetPublisher?.countryId
            );

            if (country) {
                selectedCountry.value = country;
            }

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
            placeRef.value?.forceRefreshModelValue(toMultilingualTextInput(place.value, languageTags.value));
        };

        return {
            isFormValid,
            name, nameRef,
            countries, selectedCountry,
            place, placeRef,
            requiredFieldRules,
            toMultilingualTextInput,
            submit, languageTags,
            refreshForm
        };
    }
});
</script>
