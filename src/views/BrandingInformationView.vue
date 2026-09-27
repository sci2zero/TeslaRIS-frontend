<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("updateBrandingInformationLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <branding-information-form
            ref="formRef"
            :preset-information="savedBrandingInformation"
            :logo-url="logoUrl"
            :background-url="backgroundUrl"
            :has-existing-logo="hasExistingLogo"
            :has-existing-background="hasExistingBackground"
            @update="updateBrandingInfo"
        ></branding-information-form>
        <v-row justify="center">
            <v-col>
                <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" class="submission-action" @click="formRef?.submit()">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
        </v-row>
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
                description: payload.description
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
