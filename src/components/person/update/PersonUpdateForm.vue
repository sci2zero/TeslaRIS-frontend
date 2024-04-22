<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedSex"
                            :items="sexes"
                            :label="$t('sexLabel')"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="placeOfBirth" :label="$t('placeOfBirthLabel')" :placeholder="$t('placeOfBirthLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="birthdate" type="date" :label="$t('birthdateLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="orcid" label="ORCID" placeholder="ORCID"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="mnid" label="MNID" placeholder="MNID"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="apvnt" label="APVNT" placeholder="APVNT"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopus" label="Scopus Author ID" placeholder="Scopus Author ID"></v-text-field>
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
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import type { PersonalInfo, PersonResponse, Sex } from '@/models/PersonModel';
import { useI18n } from 'vue-i18n';
import { getSexForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/sex';

export default defineComponent({
    name: "PersonUpdateForm",
    props: {
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const i18n = useI18n();
        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        });

        const placeOfBirth = ref(props.presetPerson?.personalInfo.placeOfBirth);
        const email = ref(props.presetPerson?.personalInfo.contact.contactEmail);
        const phoneNumber = ref(props.presetPerson?.personalInfo.contact.phoneNumber);
        const birthdate = ref(props.presetPerson?.personalInfo.localBirthDate);
        const orcid = ref(props.presetPerson?.personalInfo.orcid);
        const mnid = ref(props.presetPerson?.personalInfo.mnid);
        const apvnt = ref(props.presetPerson?.personalInfo.apvnt);
        const scopus = ref(props.presetPerson?.personalInfo.scopusAuthorId);

        const sexes = getSexForGivenLocale(i18n.locale.value);
        const selectedSex = ref({title: getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex, i18n.locale.value) as string, value: props.presetPerson?.personalInfo.sex as Sex});

        const updatePerson = () => {
            const updatedPerson: PersonalInfo = {
                contact: {phoneNumber: phoneNumber.value as string, contactEmail: email.value},
                localBirthDate: birthdate.value as string,
                sex: selectedSex.value.value as Sex,
                apvnt: apvnt.value,
                mnid: mnid.value,
                orcid: orcid.value,
                placeOfBirth: placeOfBirth.value,
                postalAddress: {city: [], countryId: -1, streetAndNumber: []}, // TODO: add this
                scopusAuthorId: scopus.value
            };

            emit("update", updatedPerson);
        };

        return {
            isFormValid, email, phoneNumber, birthdate,
            orcid, mnid, apvnt, scopus, sexes, selectedSex,
            toMultilingualTextInput, languageList, updatePerson,
            placeOfBirth
        };
    }
});
</script>
