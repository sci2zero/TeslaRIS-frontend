<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetOU?.name, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :placeholder="$t('nameAbbreviationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')" :rules="nonMandatoryEmailFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopusAfid" label="Scopus AFID" placeholder="Scopus AFID" :rules="scopusAfidValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris" is-website></uri-input>
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
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';
import UriInput from '@/components/core/UriInput.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import Toast from '@/components/core/Toast.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "OrganisationUnitUpdateForm",
    components: { MultilingualTextInput, OpenLayersMap, UriInput, Toast },
    props: {
        presetOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        watch(() => props.presetOU, () => {
            if (props.presetOU) {
                refreshForm();
            }
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();
        const urisRef = ref<typeof UriInput>();

        const name = ref<any>([]);
        const nameAbbreviation = ref(props.presetOU?.nameAbbreviation);
        const email = ref(props.presetOU?.contact?.contactEmail);
        const phoneNumber = ref(props.presetOU?.contact?.phoneNumber);
        const scopusAfid = ref(props.presetOU?.scopusAfid);
        const uris = ref<string[]>(props.presetOU?.uris as string[]);

        const { requiredFieldRules, scopusAfidValidationRules, nonMandatoryEmailFieldRules } = useValidationUtils();

        const submit = async () => {
            const organisationUnitId = props.presetOU?.id as number;
            const identifiers = [
                { value: scopusAfid.value, error: "scopusAfidExistsError" }
            ].filter(id => id.value);

            const results = await Promise.all(
                identifiers.map(id => OrganisationUnitService.checkIdentifierUsage(id.value as string, organisationUnitId))
            );

            const firstDuplicate = identifiers.find((_, index) => results[index].data);
            if (firstDuplicate) {
                message.value = i18n.t(firstDuplicate.error);
                snackbar.value = true;
                return;
            }

            const updatedOU: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: props.presetOU?.keyword as MultilingualContent[],
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value as string, phoneNumber: phoneNumber.value as string},
                scopusAfid: scopusAfid.value,
                uris: uris.value
            };

            emit("update", updatedOU);
        };

        const refreshForm = () => {
            nameRef.value?.clearInput();
            name.value = props.presetOU?.name as MultilingualContent[];

            uris.value = props.presetOU?.uris as string[];
            nameAbbreviation.value = props.presetOU?.nameAbbreviation;
            email.value = props.presetOU?.contact?.contactEmail;
            phoneNumber.value = props.presetOU?.contact?.phoneNumber;
            scopusAfid.value = props.presetOU?.scopusAfid;
            urisRef.value?.refreshModelValue(uris.value);

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
        };

        return {
            isFormValid, name, mapRef,
            nameAbbreviation, refreshForm,
            email, phoneNumber, scopusAfid,
            requiredFieldRules, submit, message,
            toMultilingualTextInput, languageTags,
            scopusAfidValidationRules, nameRef, uris,
            nonMandatoryEmailFieldRules, snackbar
        };
    }
});
</script>
