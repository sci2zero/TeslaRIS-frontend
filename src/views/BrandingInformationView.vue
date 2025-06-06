<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("updateBrandingInformationLabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <branding-information-form ref="formRef" :preset-information="savedBrandingInformation" @update="updateBrandingInfo"></branding-information-form>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import BrandingInformationForm from '@/components/core/BrandingInformationForm.vue';
import BrandingService from '@/services/BrandingService';
import { type BrandingInformation } from '@/models/Common';
import { useRouter } from 'vue-router';
import { useBrandingStore } from '@/stores/brandingStore';


export default defineComponent({
    name: "BrandingInformationView",
    components: { BrandingInformationForm },
    setup() {
        const formRef = ref<typeof BrandingInformationForm>();

        const savedBrandingInformation = ref();

        const i18n = useI18n();
        const router = useRouter();

        const brandingStore = useBrandingStore();

        onMounted(() => {
            document.title = i18n.t("updateBrandingInformationLabel");
            
            BrandingService.fetchBrandingInfo().then(response => {
                savedBrandingInformation.value = response.data;
            });
        });

        const updateBrandingInfo = (brandingInfo: BrandingInformation) => {
            BrandingService.updateBrandingInfo(brandingInfo).then(() => {
                brandingStore.isRebranded(brandingInfo.title);
                router.push({ name: "home" });
            });
        };

        return {
            formRef, updateBrandingInfo,
            savedBrandingInformation
        };
    }
});
</script>
