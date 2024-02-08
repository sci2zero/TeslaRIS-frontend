<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList" return-object></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')"></multilingual-text-input>
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
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ !error ? $t("savedMessage") : $t("genericErrorMessage") }}
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
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { countriesSr, countriesEn } from "@/i18n/countries";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Publisher } from "@/models/PublisherModel";
import PublisherService from "@/services/PublisherService";
import { useValidationUtils } from '@/utils/ValidationUtils';

export default defineComponent({
    name: "SubmitPublisher",
    components: {MultilingualTextInput},
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const isFormValid = ref(false);

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

        const nameRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref([]);
        const state = ref();
        const place = ref([]);

        const { requiredFieldRules } = useValidationUtils();

        const submitPublisher = (stayOnPage: boolean) => {
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

            const newPublisher: Publisher = {
                name: name.value,
                state: multilingualState,
                place: place.value
            }

            PublisherService.createPublisher(newPublisher).then(() => {
                if (stayOnPage) {
                nameRef.value?.clearInput();
                state.value = null;
                placeRef.value?.clearInput();

                error.value = false;
                snackbar.value = true;
            } else {
                router.push({ name: "publishers" });
            }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid,
            snackbar, error,
            name, nameRef,
            state, countryList,
            place, placeRef,
            requiredFieldRules,
            submitPublisher
        };
    }
});
</script>
