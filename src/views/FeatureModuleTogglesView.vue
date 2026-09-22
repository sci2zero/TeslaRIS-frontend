<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.featureModuleToggles") }}
    </h1>

    <v-row class="d-flex flex-row justify-center mt-5 mb-5">
        <v-col cols="12" sm="8" md="6">
            <v-form v-model="isFormValid" @submit.prevent>
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="toggleAssessmentModule"
                            :label="$t('toggleAssessmentModuleLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="toggleDigitalLibrary"
                            :label="$t('toggleDigitalLibraryLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="toggleDigitalRepository"
                            :label="$t('toggleDigitalRepositoryLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="d-flex flex-row justify-center">
                        <v-btn color="blue darken-1" :disabled="!isFormValid" @click="submit">
                            {{ $t("saveLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-col>
    </v-row>

    <toast v-model="snackbar" :message="$t('savedMessage')" />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Toast from '@/components/core/Toast.vue';
import { useGlobalLoading } from '@/composables/useGlobalLoading';
import FeatureModuleTogglesService from '@/services/FeatureModuleTogglesService';
import { useFeatureModuleToggles } from '@/composables/useFeatureModuleToggles';
import type { FeatureModuleToggles } from '@/models/Common';


export default defineComponent({
    name: "FeatureModuleTogglesView",
    components: { Toast },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);

        const i18n = useI18n();
        const { showLoader } = useGlobalLoading();

        const { featureModuleToggles } = useFeatureModuleToggles();

        const toggleAssessmentModule = ref(true);
        const toggleDigitalLibrary = ref(true);
        const toggleDigitalRepository = ref(true);

        const applyConfiguration = (configuration: FeatureModuleToggles) => {
            toggleAssessmentModule.value = configuration.toggleAssessmentModule;
            toggleDigitalLibrary.value = configuration.toggleDigitalLibrary;
            toggleDigitalRepository.value = configuration.toggleDigitalRepository;
        };

        watch(featureModuleToggles, applyConfiguration, { immediate: true });

        const submit = () => {
            const configuration: FeatureModuleToggles = {
                toggleAssessmentModule: toggleAssessmentModule.value,
                toggleDigitalLibrary: toggleDigitalLibrary.value,
                toggleDigitalRepository: toggleDigitalRepository.value
            };

            FeatureModuleTogglesService.saveConfigurationForSystem(configuration)
            .then(response => {
                applyConfiguration(response.data);
                snackbar.value = true;
                showLoader(i18n.t("applyingChangesLabel"));
                setTimeout(() => window.location.reload(), 2000);
            });
        };

        return {
            isFormValid, snackbar, submit,
            toggleAssessmentModule,
            toggleDigitalLibrary,
            toggleDigitalRepository
        };
    }
});
</script>
