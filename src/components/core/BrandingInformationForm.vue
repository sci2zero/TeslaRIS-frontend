<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetInformation?.title, languageTags)" />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" :rules="requiredFieldRules" :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetInformation?.description, languageTags)" is-area />
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-select
                    v-model="selectedCountry"
                    hide-details="auto"
                    :items="countries"
                    :label="$t('countryLabel')"
                    return-object
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="cityRef"
                    v-model="city"
                    :label="$t('cityLabel')"
                    :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.city, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="streetAndNumberRef"
                    v-model="streetAndNumber"
                    :label="$t('streetAndNumberLabel')"
                    :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.streetAndNumber, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="stateRef"
                    v-model="state"
                    :label="$t('stateLabel')"
                    :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.state, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="postalNumber"
                    :label="$t('postalNumberLabel')"
                    :placeholder="$t('postalNumberLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="phoneNumber"
                    :label="$t('phoneNumberLabel')"
                    :placeholder="$t('phoneNumberLabel')"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <open-layers-map
                    ref="mapRef"
                    :read-only="false"
                    :init-address="presetInformation?.location?.address"
                    :init-coordinates="[presetInformation?.location?.longitude as number, presetInformation?.location?.latitude as number]" />
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
import { defineComponent, onMounted, type PropType, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';
import { ref } from 'vue';
import { type BrandingInformation, type Country } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import CountryService from '@/services/CountryService';
import lodash from 'lodash';
import type { AxiosResponse } from 'axios';


export default defineComponent({
    name: "BrandingInformationForm",
    components: { MultilingualTextInput, OpenLayersMap },
    props: {
        presetInformation: {
            type: Object as PropType<BrandingInformation | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const titleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const cityRef = ref<typeof MultilingualTextInput>();
        const streetAndNumberRef = ref<typeof MultilingualTextInput>();
        const stateRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const title = ref<any>([]);
        const description = ref<any>([]);
        const city = ref<any>([]);
        const streetAndNumber = ref<any>([]);
        const state = ref<any>([]);
        const postalNumber = ref(props.presetInformation?.postalAddress?.postalNumber);
        const phoneNumber = ref(props.presetInformation?.phoneNumber);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1 });

        const { requiredFieldRules } = useValidationUtils();

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1 }];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });

                setAddressInfo();
            });
        };

        const setAddressInfo = () => {
            postalNumber.value = props.presetInformation?.postalAddress?.postalNumber;
            phoneNumber.value = props.presetInformation?.phoneNumber;

            if (props.presetInformation?.postalAddress?.countryId) {
                const country = countries.value.find(country =>
                    country.value === props.presetInformation?.postalAddress?.countryId
                );

                if (country) {
                    selectedCountry.value = country;
                }
            }
        };

        onMounted(fetchCountries);

        watch(() => props.presetInformation, setAddressInfo);

        const composeAddress = () => {
            const cityLine = [postalNumber.value, returnCurrentLocaleContent(city.value)]
                .filter(part => !!part)
                .join(" ");

            return [
                returnCurrentLocaleContent(streetAndNumber.value),
                cityLine,
                returnCurrentLocaleContent(state.value),
                (selectedCountry.value?.value as number) > 0 ? selectedCountry.value.title : null
            ].filter(part => !!part && part.trim().length > 0).join(", ");
        };

        // Only what this form derived is ever overwritten, so an address typed by hand or picked
        // on the map survives further edits to the postal fields.
        const lastDerivedAddress = ref("");

        const syncAddressFromPostalFields = lodash.debounce(() => {
            if (!mapRef.value) {
                return;
            }

            const currentAddress = mapRef.value.address ?? "";
            if (currentAddress && currentAddress !== lastDerivedAddress.value) {
                return;
            }

            const derivedAddress = composeAddress();
            if (!derivedAddress || derivedAddress === currentAddress) {
                return;
            }

            lastDerivedAddress.value = derivedAddress;
            mapRef.value.address = derivedAddress;
            mapRef.value.onAddressChange();
        }, 800);

        watch(
            [city, streetAndNumber, state, postalNumber, selectedCountry],
            syncAddressFromPostalFields,
            { deep: true }
        );

        const submit = () => {
            const brandingInformation: BrandingInformation = {
                title: title.value,
                description: description.value,
                location: {
                    latitude: mapRef.value?.currentPosition.lat,
                    longitude: mapRef.value?.currentPosition.lon,
                    address: mapRef.value?.address
                },
                phoneNumber: phoneNumber.value,
                postalAddress: {
                    city: city.value,
                    countryId: (selectedCountry.value?.value as number > 0) ? selectedCountry.value?.value as number : undefined,
                    streetAndNumber: streetAndNumber.value,
                    state: state.value,
                    postalNumber: postalNumber.value as string
                }
            };

            emit("update", brandingInformation);
        };

        return {
            isFormValid, title, titleRef,
            description, descriptionRef,
            city, cityRef, streetAndNumber, streetAndNumberRef,
            state, stateRef, postalNumber, phoneNumber,
            countries, selectedCountry, mapRef,
            toMultilingualTextInput,
            requiredFieldRules,
            languageTags, submit
        };
    }
});
</script>
