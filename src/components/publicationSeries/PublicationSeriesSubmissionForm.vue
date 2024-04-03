<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="abbreviationsRef" v-model="nameAbbreviations" :label="$t('nameAbbreviationLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="eIssn" label="E-ISSN" placeholder="E-ISSN"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="printIssn" label="Print ISSN" placeholder="Print ISSN"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedLanguages"
                                :label="$t('languageLabel')"
                                :items="languageList"
                                multiple
                            ></v-select>
                        </v-col>
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Journal } from "@/models/JournalModel";
import JournalService from '@/services/JournalService';
import { PublicationSeriesType } from '@/models/PublicationSeriesModel';
import BookSeriesService from '@/services/BookSeriesService';
import { useValidationUtils } from '@/utils/ValidationUtils';


export default defineComponent({
    name: "SubmitPublicationSeries",
    components: {MultilingualTextInput},
    props: {
        inputType: {
            type: String,
            required: true
        },
        inModal: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>([]);
        const defaultLanguage = ref(-1);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                    if (i18n.locale.value.toUpperCase() === languageTag.languageCode) {
                        selectedLanguages.value.push(languageTag.id);
                        defaultLanguage.value = languageTag.id;
                    }
                })
            });
        })

        const titleRef = ref<typeof MultilingualTextInput>();
        const abbreviationsRef = ref<typeof MultilingualTextInput>();

        const title = ref([]);
        const nameAbbreviations = ref([]);
        const eIssn = ref("");
        const printIssn = ref("");

        const { requiredFieldRules } = useValidationUtils();

        const submitPublicationSeries = (stayOnPage: boolean) => {
            const newPublicationSeries: Journal = {
                title: title.value,
                eissn: eIssn.value,
                printISSN: printIssn.value,
                languageTagIds: selectedLanguages.value,
                nameAbbreviation: nameAbbreviations.value,
                contributions: []
            };

            switch(props.inputType) {
                case PublicationSeriesType.JOURNAL.toString():
                    JournalService.createJournal(newPublicationSeries).then((response) => {
                        if (props.inModal) {
                            emit("create", response.data);
                            return;
                        }

                        if (stayOnPage) {
                            titleRef.value?.clearInput();
                            abbreviationsRef.value?.clearInput();
                            eIssn.value = "";
                            printIssn.value = "";
                            selectedLanguages.value = [defaultLanguage.value];

                            error.value = false;
                            snackbar.value = true;
                        } else {
                            router.push({ name: "journalLandingPage", params: {id: response.data.id} });
                        }
                    }).catch(() => {
                        error.value = true;
                        snackbar.value = true;
                    });
                    break;
                case PublicationSeriesType.BOOK_SERIES.toString():
                    BookSeriesService.createBookSeries(newPublicationSeries).then((response) => {
                        if (props.inModal) {
                            emit("create", response.data);
                            return;
                        }
                        
                        if (stayOnPage) {
                            titleRef.value?.clearInput();
                            abbreviationsRef.value?.clearInput();
                            eIssn.value = "";
                            printIssn.value = "";
                            selectedLanguages.value = [defaultLanguage.value];

                            error.value = false;
                            snackbar.value = true;
                        } else {
                            router.push({ name: "bookSeriesLandingPage", params: {id: response.data.id} });
                        }
                    }).catch(() => {
                        error.value = true;
                        snackbar.value = true;
                    });
                    break;
            }
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, error,
            title, titleRef,
            eIssn, printIssn, languageList, selectedLanguages,
            nameAbbreviations, abbreviationsRef,
            requiredFieldRules,
            submitPublicationSeries
        };
    }
});
</script>
