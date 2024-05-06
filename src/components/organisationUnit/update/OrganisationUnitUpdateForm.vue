<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetOU?.name, languageList)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :placeholder="$t('nameAbbreviationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <open-layers-map ref="mapRef" :read-only="false" :init-coordinates="[presetOU?.location?.longitude as number, presetOU?.location?.latitude as number]"></open-layers-map>
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
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import type { OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';

export default defineComponent({
    name: "OrganisationUnitUpdateForm",
    components: { MultilingualTextInput, OpenLayersMap },
    props: {
        presetOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const name = ref([]);
        const nameAbbreviation = ref(props.presetOU?.nameAbbreviation);
        const email = ref(props.presetOU?.contact?.contactEmail);
        const phoneNumber = ref(props.presetOU?.contact?.phoneNumber);

        const { requiredFieldRules } = useValidationUtils();

        const updateOU = () => {
            const updatedOU: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: props.presetOU?.keyword as MultilingualContent[],
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value as string, phoneNumber: phoneNumber.value as string}
            };

            emit("update", updatedOU);
        };

        return {
            isFormValid, name,
            nameRef, mapRef,
            nameAbbreviation,
            email, phoneNumber,
            requiredFieldRules, updateOU,
            toMultilingualTextInput, languageList
        };
    }
});
</script>