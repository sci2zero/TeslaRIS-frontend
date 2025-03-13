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
                        <multilingual-text-input ref="placeRef" v-model="place" :label="$t('placeLabel')"></multilingual-text-input>
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

    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : $t('genericErrorMessage')" />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Country } from '@/models/Common';
import { onMounted } from 'vue';
import type { AxiosResponse } from 'axios';
import type { Publisher } from "@/models/PublisherModel";
import PublisherService from "@/services/PublisherService";
import { useValidationUtils } from '@/utils/ValidationUtils';
import CountryService from '@/services/CountryService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import Toast from '../core/Toast.vue';


export default defineComponent({
    name: "SubmitPublisher",
    components: {MultilingualTextInput, Toast},
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();

        onMounted(() => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1}];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });
            });
        });

        const fetchCountries = () => {
            
        };

        watch(i18n.locale, () => {
            fetchCountries();
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();

        const name = ref([]);
        const place = ref([]);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1});

        const { requiredFieldRules } = useValidationUtils();

        const submit = (stayOnPage: boolean) => {

            const newPublisher: Publisher = {
                name: name.value,
                countryId: selectedCountry.value?.value === -1 ? undefined : selectedCountry.value?.value as number,
                place: place.value
            };

            PublisherService.createPublisher(newPublisher).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

            if (stayOnPage) {
                nameRef.value?.clearInput();
                placeRef.value?.clearInput();

                selectedCountry.value = { title: "", value: -1};

                error.value = false;
                snackbar.value = true;
            } else {
                router.push({ name: "publisherLandingPage", params: {id: response.data.id} });
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
            countries, selectedCountry,
            place, placeRef,
            requiredFieldRules,
            submit
        };
    }
});
</script>
