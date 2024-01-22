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
                    <v-col cols="10">
                        <v-autocomplete v-model="state" :label="$t('stateLabel')" :items="countryList" return-object></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="placeRef" :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
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

export default defineComponent({
    name: "SubmitConferenceView",
    components: {MultilingualTextInput},
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);

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

        const nameRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref([]);
        const state = ref();
        const place = ref([]);

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const submitPublisher = (stayOnPage: boolean) => {
            let multilingualState: MultilingualContent[] = [];
            if (state.value) {
                languageList.value?.forEach((language: LanguageTagResponse) => {
                    if (language.languageCode === i18n.locale.value.toUpperCase()) {
                        multilingualState = [{content: state.value, languageTag: i18n.locale.value.toUpperCase(), languageTagId: language.id, priority: 1}];
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

                snackbar.value = true;
            } else {
                router.push({ name: "publishers" });
            }
            });
        };

        return {
            isFormValid,
            snackbar,
            name, nameRef,
            state, countryList,
            place, placeRef,
            requiredFieldRules,
            submitPublisher
        };
    }
});
</script>