<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("routeLabel.crisContextInformation") }}
    </h1>

    <v-row class="d-flex flex-row justify-center mt-5 mb-5">
        <v-col cols="12" sm="10" md="8">
            <v-form v-model="isFormValid" @submit.prevent>
                <v-card class="pa-4 mb-6" variant="outlined">
                    <v-card-title class="text-subtitle-1 font-weight-bold px-0">
                        {{ $t("enabledModulesLabel") }}
                    </v-card-title>
                    <v-card-subtitle class="px-0 pb-2">
                        {{ $t("enabledModulesDescriptionLabel") }}
                    </v-card-subtitle>

                    <v-row>
                        <v-col cols="12" md="4">
                            <v-checkbox
                                v-model="toggleAssessmentModule"
                                :label="$t('toggleAssessmentModuleLabel')"
                            />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-checkbox
                                v-model="toggleDigitalLibrary"
                                :label="$t('toggleDigitalLibraryLabel')"
                            />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-checkbox
                                v-model="toggleDigitalRepository"
                                :label="$t('toggleDigitalRepositoryLabel')"
                            />
                        </v-col>
                    </v-row>
                </v-card>

                <v-card class="pa-4" variant="outlined">
                    <v-card-title class="text-subtitle-1 font-weight-bold px-0">
                        {{ $t("crisConfigurationLabel") }}
                    </v-card-title>
                    <v-card-subtitle class="px-0 mb-5">
                        {{ $t("crisConfigurationDescriptionLabel") }}
                    </v-card-subtitle>

                    <v-row>
                        <v-col cols="12">
                            <v-select
                                v-model="selectedMetadataLicense"
                                :items="licenseTypes"
                                :label="$t('metadataLicenseLabel') + '*'"
                                :rules="requiredSelectionRules"
                                return-object
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="personNationalIdRegularExpression"
                                :label="$t('personNationalIdPatternLabel') + '*'"
                                :rules="regularExpressionRules"
                                :hint="$t('regularExpressionHintLabel')"
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="projectNationalIdRegularExpression"
                                :label="$t('projectNationalIdPatternLabel') + '*'"
                                :rules="regularExpressionRules"
                                :hint="$t('regularExpressionHintLabel')"
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="organisationUnitNationalIdRegularExpression"
                                :label="$t('organisationUnitNationalIdPatternLabel') + '*'"
                                :rules="regularExpressionRules"
                                :hint="$t('regularExpressionHintLabel')"
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="documentNationalIdRegularExpression"
                                :label="$t('documentNationalIdPatternLabel') + '*'"
                                :rules="regularExpressionRules"
                                :hint="$t('regularExpressionHintLabel')"
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                </v-card>

                <v-row>
                    <v-col class="d-flex flex-row justify-center mt-5">
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
import CrisContextInformationService from '@/services/CrisContextInformationService';
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';
import type { CrisContextInformation } from '@/models/Common';
import { License } from '@/models/DocumentFileModel';
import { getLicenseTitleFromValueAutoLocale, getLisenseTypesForGivenLocale } from '@/i18n/license';


export default defineComponent({
    name: "CrisContextInformationView",
    components: { Toast },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);

        const i18n = useI18n();
        const { showLoader } = useGlobalLoading();
        const { crisContextInformation } = useCrisContextInformation();

        const licenseTypes = getLisenseTypesForGivenLocale();

        const toggleAssessmentModule = ref(true);
        const toggleDigitalLibrary = ref(true);
        const toggleDigitalRepository = ref(true);
        const personNationalIdRegularExpression = ref(".*");
        const projectNationalIdRegularExpression = ref(".*");
        const organisationUnitNationalIdRegularExpression = ref(".*");
        const documentNationalIdRegularExpression = ref(".*");
        const selectedMetadataLicense = ref({
            title: getLicenseTitleFromValueAutoLocale(License.CC0) as string,
            value: License.CC0
        });

        const requiredSelectionRules = [
            (value: unknown) => !!value || i18n.t("mandatoryFieldError")
        ];

        const regularExpressionRules = [
            (value: string) => !!value || i18n.t("mandatoryFieldError"),
            (value: string) => {
                try {
                    new RegExp(value);
                    return true;
                } catch {
                    return i18n.t("invalidRegularExpressionError");
                }
            }
        ];

        const applyConfiguration = (configuration: CrisContextInformation) => {
            toggleAssessmentModule.value = configuration.toggleAssessmentModule;
            toggleDigitalLibrary.value = configuration.toggleDigitalLibrary;
            toggleDigitalRepository.value = configuration.toggleDigitalRepository;
            personNationalIdRegularExpression.value = configuration.personNationalIdRegularExpression;
            projectNationalIdRegularExpression.value = configuration.projectNationalIdRegularExpression;
            organisationUnitNationalIdRegularExpression.value =
                configuration.organisationUnitNationalIdRegularExpression;
            documentNationalIdRegularExpression.value =
                configuration.documentNationalIdRegularExpression;
            selectedMetadataLicense.value = {
                title: getLicenseTitleFromValueAutoLocale(configuration.metadataLicense) as string,
                value: configuration.metadataLicense
            };
        };

        watch(crisContextInformation, applyConfiguration, { immediate: true });

        const submit = () => {
            const configuration: CrisContextInformation = {
                toggleAssessmentModule: toggleAssessmentModule.value,
                toggleDigitalLibrary: toggleDigitalLibrary.value,
                toggleDigitalRepository: toggleDigitalRepository.value,
                personNationalIdRegularExpression: personNationalIdRegularExpression.value,
                projectNationalIdRegularExpression: projectNationalIdRegularExpression.value,
                organisationUnitNationalIdRegularExpression:
                    organisationUnitNationalIdRegularExpression.value,
                documentNationalIdRegularExpression: documentNationalIdRegularExpression.value,
                metadataLicense: selectedMetadataLicense.value.value
            };

            CrisContextInformationService.saveConfigurationForSystem(configuration)
            .then(response => {
                applyConfiguration(response.data);
                snackbar.value = true;
                showLoader(i18n.t("applyingChangesLabel"));
                setTimeout(() => window.location.reload(), 2000);
            });
        };

        return {
            isFormValid, snackbar, submit,
            licenseTypes, selectedMetadataLicense,
            requiredSelectionRules, regularExpressionRules,
            toggleAssessmentModule,
            toggleDigitalLibrary,
            toggleDigitalRepository,
            personNationalIdRegularExpression,
            projectNationalIdRegularExpression,
            organisationUnitNationalIdRegularExpression,
            documentNationalIdRegularExpression
        };
    }
});
</script>
