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
                        <v-text-field v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :placeholder="$t('nameAbbreviationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col cols="10">
                            <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" :label="$t('keywordsLabel')" @set-input="keywords = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <open-layers-map ref="mapRef" :read-only="false"></open-layers-map>
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
import { computed } from 'vue';
import type { OrganisationUnitRequest } from "@/models/OrganisationUnitModel";
import OpenLayersMap from '../core/OpenLayersMap.vue';
import OrganisationUnitService from "@/services/OrganisationUnitService";

export default defineComponent({
    name: "SubmitOrganizationUnit",
    components: {MultilingualTextInput, OpenLayersMap},
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const nameRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const name = ref([]);
        const nameAbbreviation = ref("");
        const email = ref("");
        const phoneNumber = ref("");
        const keywords = ref([]);

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const submitOU = (stayOnPage: boolean) => {
            const newOu: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: keywords.value,
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value, phoneNumber: phoneNumber.value}
            };

            OrganisationUnitService.createOrganisationUnit(newOu).then(() => {
                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    nameAbbreviation.value = "";
                    email.value = "";
                    phoneNumber.value = "";
                    mapRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "organisationUnits" });
                }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, error,
            name, nameRef,
            nameAbbreviation,
            email, phoneNumber,
            keywords, keywordsRef,
            requiredFieldRules,
            submitOU, mapRef
        };
    }
});
</script>
