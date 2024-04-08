<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetPublisher?.name, languageList)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList" return-object></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')" :initial-value="toMultilingualTextInput(presetPublisher?.place, languageList)"></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { countriesSr, countriesEn } from "@/i18n/countries";
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Publisher } from "@/models/PublisherModel";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';

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

        const snackbar = ref(false);
        const error = ref(false);

        const i18n = useI18n();

        const countryList = computed(() => {
            if (i18n.locale.value === "sr") {
                return countriesSr;
            } else {
                return countriesEn;
            }
        });

        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref([]);
        const state = ref(returnCurrentLocaleContent(props.presetPublisher?.state));
        const place = ref([]);

        const { requiredFieldRules } = useValidationUtils();

        const updatePublisher = () => {
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

            const updatedPublisher: Publisher = {
                name: name.value,
                state: multilingualState,
                place: place.value
            };

            emit("update", updatedPublisher);
        };

        return {
            isFormValid,
            snackbar, error,
            name, nameRef,
            state, countryList,
            place, placeRef,
            requiredFieldRules,
            updatePublisher,
            toMultilingualTextInput,
            languageList
        };
    }
});
</script>
