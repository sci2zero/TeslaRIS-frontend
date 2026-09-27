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
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { type BrandingInformation } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';


export interface BrandingFormPayload {
    title: any;
    description: any;
    logoFile: File | null;
    backgroundFile: File | null;
    removeLogo: boolean;
    removeBackground: boolean;
}

function toFile(value: File | File[] | null | undefined): File | null {
    if (!value) {
        return null;
    }
    return Array.isArray(value) ? value[0] ?? null : value;
}

export default defineComponent({
    name: "BrandingInformationForm",
    components: {MultilingualTextInput},
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

        const title = ref<any>([]);
        const description = ref<any>([]);
        const logoFile = ref<File | File[] | null>(null);
        const backgroundFile = ref<File | File[] | null>(null);
        const removeLogo = ref(false);
        const removeBackground = ref(false);

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

        const submit = () => {
            const payload: BrandingFormPayload = {
                title: title.value,
                description: description.value,
                logoFile: selectedLogoFile.value,
                backgroundFile: selectedBackgroundFile.value,
                removeLogo: removeLogo.value && !selectedLogoFile.value,
                removeBackground: removeBackground.value && !selectedBackgroundFile.value
            };

            emit("update", payload);
        };

        return {
            isFormValid, title, titleRef,
            description, descriptionRef,
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
