<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-text-box-outline"
            :title="$t('brandingIdentityLabel')"
            :description="$t('brandingIdentityHint')"
        >
            <multilingual-text-input
                ref="titleRef"
                v-model="title"
                :rules="requiredFieldRules"
                :label="$t('titleLabel') + '*'"
                :initial-value="toMultilingualTextInput(presetInformation?.title, languageTags)"
            />
            <multilingual-text-input
                ref="descriptionRef"
                v-model="description"
                :rules="requiredFieldRules"
                :label="$t('descriptionLabel') + '*'"
                :initial-value="toMultilingualTextInput(presetInformation?.description, languageTags)"
                is-area
            />
        </form-section>

        <form-section
            icon="mdi-image-outline"
            :title="$t('brandingAppearanceLabel')"
            :description="$t('brandingAppearanceHint')"
        >
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ui-file-input
                    v-model="logoFile"
                    :label="$t('brandingLogoLabel')"
                    accept="image/png,image/jpeg"
                    :preview-url="logoPreviewUrl"
                    :show-remove="hasExistingLogo && !removeLogo && !logoFile"
                    :remove-label="$t('removeLogoLabel')"
                    @remove="removeLogo = true; logoFile = null"
                />
                <ui-file-input
                    v-model="backgroundFile"
                    :label="$t('brandingBackgroundLabel')"
                    accept="image/png,image/jpeg"
                    :preview-url="backgroundPreviewUrl"
                    preview-wide
                    :show-remove="hasExistingBackground && !removeBackground && !backgroundFile"
                    :remove-label="$t('removeBackgroundLabel')"
                    @remove="removeBackground = true; backgroundFile = null"
                />
            </div>
        </form-section>

        <form-section
            icon="mdi-brightness-6"
            :title="$t('homeThemeLabel')"
            :description="$t('brandingThemeHint')"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input
                    v-model="selectedChromeTheme"
                    control="select"
                    :items="themeOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('chromeThemeLabel')"
                />
                <ui-input
                    v-model="selectedHeroTheme"
                    control="select"
                    :items="themeOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('heroThemeLabel')"
                />
            </div>
        </form-section>

        <form-section
            icon="mdi-card-account-phone-outline"
            :title="$t('contactLabel')"
            :description="$t('brandingContactHint')"
        >
            <multilingual-text-input
                ref="streetAndNumberRef"
                v-model="streetAndNumber"
                :label="$t('streetAndNumberLabel')"
                :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.streetAndNumber, languageTags)"
            />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <multilingual-text-input
                    ref="cityRef"
                    v-model="city"
                    :label="$t('cityLabel')"
                    :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.city, languageTags)"
                />
                <ui-input
                    v-model="postalNumber"
                    :label="$t('postalNumberLabel')"
                />
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <multilingual-text-input
                    ref="stateRef"
                    v-model="state"
                    :label="$t('stateLabel')"
                    :initial-value="toMultilingualTextInput(presetInformation?.postalAddress?.state, languageTags)"
                />
                <ui-input
                    v-model="selectedCountry"
                    control="select"
                    :items="countries"
                    :label="$t('countryLabel')"
                    return-object
                />
            </div>
            <ui-input
                v-model="phoneNumber"
                class="max-w-sm"
                :label="$t('phoneNumberLabel')"
            />
        </form-section>

        <form-section
            icon="mdi-map-marker-outline"
            :title="$t('locationLabel')"
            :description="$t('brandingLocationHint')"
        >
            <ui-input
                v-model="mapAddress"
                :label="$t('addressLabel')"
                :placeholder="$t('addressLabel')"
            />
            <div v-if="mapEmbedUrl" class="overflow-hidden rounded-xl border border-slate-200">
                <iframe
                    class="h-80 w-full border-0"
                    :src="mapEmbedUrl"
                    :title="$t('locationLabel')"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    allowfullscreen
                ></iframe>
            </div>
        </form-section>

        <p class="required-fields-message">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, type PropType, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UiInput from '@/components/ui/input/Input.vue';
import UiFileInput from '@/components/ui/file-input/FileInput.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { type BrandingInformation, type Country } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import CountryService from '@/services/CountryService';
import lodash from 'lodash';
import type { AxiosResponse } from 'axios';
import { normalizeHomeTheme, useHomeTheme, type HomeTheme } from '@/composables/useHomeTheme';


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
    chromeTheme: HomeTheme;
    heroTheme: HomeTheme;
}

export default defineComponent({
    name: "BrandingInformationForm",
    components: { MultilingualTextInput, UiInput, UiFileInput, FormSection },
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
        const mapAddress = ref(props.presetInformation?.location?.address ?? "");
        const latitude = ref<number | undefined>(props.presetInformation?.location?.latitude);
        const longitude = ref<number | undefined>(props.presetInformation?.location?.longitude);
        const embedQuery = ref(mapAddress.value);

        const i18n = useI18n();
        const { chromeTheme, heroTheme } = useHomeTheme();
        const asTheme = (value: unknown, fallback: HomeTheme): HomeTheme =>
            normalizeHomeTheme(value) ?? fallback;
        const selectedChromeTheme = ref<HomeTheme>(
            asTheme(props.presetInformation?.chromeTheme, chromeTheme.value)
        );
        const selectedHeroTheme = ref<HomeTheme>(
            asTheme(props.presetInformation?.heroTheme, heroTheme.value)
        );
        const themeOptions = computed(() => [
            { title: i18n.t("lightThemeLabel"), value: "light" },
            { title: i18n.t("darkThemeLabel"), value: "dark" },
        ]);
        const mapEmbedUrl = computed(() => {
            const query = embedQuery.value.trim()
                || (latitude.value && longitude.value ? `${latitude.value},${longitude.value}` : "");
            if (!query) {
                return "";
            }

            const params = new URLSearchParams({
                q: query,
                z: "16",
                hl: i18n.locale.value,
                output: "embed",
            });

            return `https://maps.google.com/maps?${params.toString()}`;
        });

        const title = ref<any>([]);
        const description = ref<any>([]);
        const logoFile = ref<File | null>(null);
        const backgroundFile = ref<File | null>(null);
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

        watch(logoFile, (file) => {
            if (file) {
                removeLogo.value = false;
            }
        });

        watch(backgroundFile, (file) => {
            if (file) {
                removeBackground.value = false;
            }
        });

        const logoPreviewUrl = computed(() => removeLogo.value ? "" : props.logoUrl);
        const backgroundPreviewUrl = computed(() => removeBackground.value ? "" : props.backgroundUrl);

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

        const skipLocationWatch = ref(false);

        watch(() => props.presetInformation, (preset) => {
            setAddressInfo();
            selectedChromeTheme.value = asTheme(preset?.chromeTheme, chromeTheme.value);
            selectedHeroTheme.value = asTheme(preset?.heroTheme, heroTheme.value);

            const presetLocation = preset?.location;
            if (!presetLocation || mapAddress.value) {
                return;
            }

            skipLocationWatch.value = true;
            mapAddress.value = presetLocation.address ?? "";
            embedQuery.value = mapAddress.value;
            latitude.value = presetLocation.latitude;
            longitude.value = presetLocation.longitude;
        });

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

        const geocodeAddress = lodash.debounce((address: string) => {
            if (!address.trim()) {
                return;
            }

            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`)
                .then((response) => response.json())
                .then((data) => {
                    const result = data[0];
                    if (!result) {
                        return;
                    }

                    latitude.value = parseFloat(result.lat);
                    longitude.value = parseFloat(result.lon);
                });
        }, 800);

        const syncAddressFromPostalFields = lodash.debounce(() => {
            const currentAddress = mapAddress.value ?? "";
            if (currentAddress && currentAddress !== lastDerivedAddress.value) {
                return;
            }

            const derivedAddress = composeAddress();
            if (!derivedAddress || derivedAddress === currentAddress) {
                return;
            }

            lastDerivedAddress.value = derivedAddress;
            mapAddress.value = derivedAddress;
        }, 800);

        const updateEmbedQuery = lodash.debounce((address: string) => {
            embedQuery.value = address;
        }, 600);

        watch(mapAddress, (address) => {
            if (skipLocationWatch.value) {
                skipLocationWatch.value = false;
                return;
            }

            const nextAddress = address ?? "";
            updateEmbedQuery(nextAddress);
            geocodeAddress(nextAddress);
        });

        watch(
            [city, streetAndNumber, state, postalNumber, selectedCountry],
            syncAddressFromPostalFields,
            { deep: true }
        );

        const submit = () => {
            const payload: BrandingFormPayload = {
                title: title.value,
                description: description.value,
                logoFile: logoFile.value,
                backgroundFile: backgroundFile.value,
                removeLogo: removeLogo.value && !logoFile.value,
                removeBackground: removeBackground.value && !backgroundFile.value,
                location: {
                    latitude: latitude.value,
                    longitude: longitude.value,
                    address: mapAddress.value
                },
                phoneNumber: phoneNumber.value,
                postalAddress: {
                    city: city.value,
                    countryId: (selectedCountry.value?.value as number > 0) ? selectedCountry.value?.value as number : undefined,
                    streetAndNumber: streetAndNumber.value,
                    state: state.value,
                    postalNumber: postalNumber.value as string
                },
                chromeTheme: asTheme(selectedChromeTheme.value, "dark"),
                heroTheme: asTheme(selectedHeroTheme.value, "dark")
            };

            emit("update", payload);
        };

        return {
            isFormValid, title, titleRef,
            description, descriptionRef,
            city, cityRef, streetAndNumber, streetAndNumberRef,
            state, stateRef, postalNumber, phoneNumber,
            countries, selectedCountry, mapAddress, mapEmbedUrl,
            toMultilingualTextInput,
            requiredFieldRules,
            languageTags, submit,
            logoFile, backgroundFile,
            logoPreviewUrl, backgroundPreviewUrl,
            removeLogo, removeBackground,
            selectedChromeTheme, selectedHeroTheme, themeOptions
        };
    }
});
</script>

