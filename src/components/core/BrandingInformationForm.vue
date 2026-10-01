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
            <v-col cols="12" md="6">
                <h3 class="text-subtitle-1 font-weight-medium mb-3">
                    {{ $t("brandingLogoLabel") }}
                </h3>
                <v-file-input
                    v-model="logoFile"
                    :label="$t('brandingLogoLabel')"
                    accept="image/png,image/jpeg"
                    prepend-icon="mdi-image"
                    show-size
                    clearable
                ></v-file-input>
                <img
                    v-if="logoPreviewUrl"
                    :src="logoPreviewUrl"
                    alt=""
                    class="branding-preview-image mb-3"
                />
                <v-btn
                    v-if="hasExistingLogo && !removeLogo"
                    density="compact"
                    variant="outlined"
                    @click="removeLogo = true; logoFile = null">
                    {{ $t("removeLogoLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="12" md="6">
                <h3 class="text-subtitle-1 font-weight-medium mb-3">
                    {{ $t("brandingBackgroundLabel") }}
                </h3>
                <v-file-input
                    v-model="backgroundFile"
                    :label="$t('brandingBackgroundLabel')"
                    accept="image/png,image/jpeg"
                    prepend-icon="mdi-image-area"
                    show-size
                    clearable
                ></v-file-input>
                <img
                    v-if="backgroundPreviewUrl"
                    :src="backgroundPreviewUrl"
                    alt=""
                    class="branding-preview-image branding-preview-image--wide mb-3"
                />
                <v-btn
                    v-if="hasExistingBackground && !removeBackground"
                    density="compact"
                    variant="outlined"
                    @click="removeBackground = true; backgroundFile = null">
                    {{ $t("removeBackgroundLabel") }}
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <ui-input
                    v-model="selectedCountry"
                    control="select"
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
                <ui-input
                    v-model="postalNumber"
                    :label="$t('postalNumberLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <ui-input
                    v-model="phoneNumber"
                    :label="$t('phoneNumberLabel')"
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
import { computed, defineComponent, onMounted, type PropType, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';
import UiInput from '@/components/ui/input/Input.vue';
import { ref } from 'vue';
import { type BrandingInformation, type Country } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import CountryService from '@/services/CountryService';
import lodash from 'lodash';
import type { AxiosResponse } from 'axios';


export interface BrandingFormPayload {
    title: any;
    description: any;
    logoFile: File | null;
    backgroundFile: File | null;
    removeLogo: boolean;
    removeBackground: boolean;
    location: BrandingInformation["location"];
    phoneNumber?: string;
    postalAddress: BrandingInformation["postalAddress"];
}

function toFile(value: File | File[] | null | undefined): File | null {
    if (!value) {
        return null;
    }
    return Array.isArray(value) ? value[0] ?? null : value;
}

export default defineComponent({
    name: "BrandingInformationForm",
    components: { MultilingualTextInput, OpenLayersMap, UiInput },
    props: {
        presetInformation: {
            type: Object as PropType<BrandingInformation | undefined>,
            default: undefined
        },
        logoUrl: {
            type: String,
            default: ""
        },
        backgroundUrl: {
            type: String,
            default: ""
        },
        hasExistingLogo: {
            type: Boolean,
            default: false
        },
        hasExistingBackground: {
            type: Boolean,
            default: false
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
        const logoFile = ref<File | File[] | null>(null);
        const backgroundFile = ref<File | File[] | null>(null);
        const removeLogo = ref(false);
        const removeBackground = ref(false);
        const city = ref<any>([]);
        const streetAndNumber = ref<any>([]);
        const state = ref<any>([]);
        const postalNumber = ref(props.presetInformation?.postalAddress?.postalNumber);
        const phoneNumber = ref(props.presetInformation?.phoneNumber);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1 });

        const { requiredFieldRules } = useValidationUtils();

        const selectedLogoFile = computed(() => toFile(logoFile.value));
        const selectedBackgroundFile = computed(() => toFile(backgroundFile.value));

        const logoObjectUrl = ref<string | null>(null);
        const backgroundObjectUrl = ref<string | null>(null);

        watch(selectedLogoFile, (file) => {
            if (logoObjectUrl.value) {
                URL.revokeObjectURL(logoObjectUrl.value);
                logoObjectUrl.value = null;
            }
            if (file) {
                logoObjectUrl.value = URL.createObjectURL(file);
                removeLogo.value = false;
            }
        });

        watch(selectedBackgroundFile, (file) => {
            if (backgroundObjectUrl.value) {
                URL.revokeObjectURL(backgroundObjectUrl.value);
                backgroundObjectUrl.value = null;
            }
            if (file) {
                backgroundObjectUrl.value = URL.createObjectURL(file);
                removeBackground.value = false;
            }
        });

        const logoPreviewUrl = computed(() => {
            if (removeLogo.value && !selectedLogoFile.value) {
                return "";
            }
            return logoObjectUrl.value || props.logoUrl;
        });

        const backgroundPreviewUrl = computed(() => {
            if (removeBackground.value && !selectedBackgroundFile.value) {
                return "";
            }
            return backgroundObjectUrl.value || props.backgroundUrl;
        });

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
            const payload: BrandingFormPayload = {
                title: title.value,
                description: description.value,
                logoFile: selectedLogoFile.value,
                backgroundFile: selectedBackgroundFile.value,
                removeLogo: removeLogo.value && !selectedLogoFile.value,
                removeBackground: removeBackground.value && !selectedBackgroundFile.value,
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

            emit("update", payload);
        };

        return {
            isFormValid, title, titleRef,
            description, descriptionRef,
            city, cityRef, streetAndNumber, streetAndNumberRef,
            state, stateRef, postalNumber, phoneNumber,
            countries, selectedCountry, mapRef,
            toMultilingualTextInput,
            requiredFieldRules,
            languageTags, submit,
            logoFile, backgroundFile,
            logoPreviewUrl, backgroundPreviewUrl,
            removeLogo, removeBackground
        };
    }
});
</script>

<style scoped>
.branding-preview-image {
    display: block;
    max-height: 96px;
    width: auto;
    object-fit: contain;
}

.branding-preview-image--wide {
    max-height: 140px;
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
}
</style>
