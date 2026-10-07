<template>
    <v-container>
        <header class="mb-8">
            <h1 class="text-3xl font-bold tracking-tight text-slate-800">
                {{ $t("updateBrandingInformationLabel") }}
            </h1>
        </header>
        <branding-information-form
            ref="formRef"
            :preset-information="savedBrandingInformation"
            :logo-url="logoUrl"
            :background-url="backgroundUrl"
            :has-existing-logo="hasExistingLogo"
            :has-existing-background="hasExistingBackground"
            @update="updateBrandingInfo"
        ></branding-information-form>
        <div class="mt-6">
            <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" class="submission-action" @click="formRef?.submit()">
                {{ $t("saveLabel") }}
            </v-btn>
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import BrandingInformationForm, { type BrandingFormPayload } from '@/components/core/BrandingInformationForm.vue';
import BrandingService from '@/services/BrandingService';
import { type BrandingInformation } from '@/models/Common';
import { useRouter } from 'vue-router';
import { usePublicConfigurationStore } from '@/stores/publicConfigurationStore';
import { fetchBrandingInformation } from '@/composables/useBrandingInformation';


export default defineComponent({
    name: "BrandingInformationView",
    components: { BrandingInformationForm },
    setup() {
        const formRef = ref<typeof BrandingInformationForm>();

        const savedBrandingInformation = ref<BrandingInformation>();

        const i18n = useI18n();
        const router = useRouter();

        const publicConfigurationStore = usePublicConfigurationStore();
        const logoUrl = computed(() =>
            publicConfigurationStore.hasCustomLogo ? publicConfigurationStore.logoDisplayUrl : ""
        );
        const backgroundUrl = computed(() =>
            publicConfigurationStore.hasCustomBackground ? publicConfigurationStore.backgroundDisplayUrl : ""
        );
        const hasExistingLogo = computed(() => publicConfigurationStore.hasCustomLogo);
        const hasExistingBackground = computed(() => publicConfigurationStore.hasCustomBackground);

        onMounted(() => {
            document.title = i18n.t("updateBrandingInformationLabel");

            BrandingService.fetchBrandingInfo().then(response => {
                savedBrandingInformation.value = response.data;
            });
        });

        const updateBrandingInfo = async (payload: BrandingFormPayload) => {
            const brandingInfo: BrandingInformation = {
                title: payload.title,
                description: payload.description,
                location: payload.location,
                phoneNumber: payload.phoneNumber,
                postalAddress: payload.postalAddress,
                chromeTheme: payload.chromeTheme,
                heroTheme: payload.heroTheme
            };

            await BrandingService.updateBrandingInfo(brandingInfo);

            if (payload.removeLogo) {
                await BrandingService.removeLogo();
            } else if (payload.logoFile) {
                await BrandingService.updateLogo(payload.logoFile);
            }

            if (payload.removeBackground) {
                await BrandingService.removeBackground();
            } else if (payload.backgroundFile) {
                await BrandingService.updateBackground(payload.backgroundFile);
            }

            await fetchBrandingInformation();
            await publicConfigurationStore.refreshFromBackend();
            router.push({ name: "home" });
        };

        return {
            formRef, updateBrandingInfo,
            savedBrandingInformation,
            logoUrl,
            backgroundUrl,
            hasExistingLogo,
            hasExistingBackground
        };
    }
});
</script>
