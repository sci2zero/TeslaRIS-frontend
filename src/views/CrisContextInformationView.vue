<template>
    <h1 class="mb-6 text-3xl font-bold tracking-tight text-slate-800">
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
                        <v-col cols="12" md="4">
                            <v-checkbox
                                v-model="toggleRegistration"
                                :label="$t('toggleRegistrationLabel')"
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
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="nationalIdentifierNameRef"
                                v-model="nationalIdentifierName"
                                :label="$t('nationalIdentifierNameLabel')"
                                :initial-value="toMultilingualTextInput(
                                    crisContextInformation.nationalIdentifierName, languageTags)"
                            />
                        </v-col>
                    </v-row>
                </v-card>

                <v-card class="pa-4 mt-6" variant="outlined">
                    <v-card-title class="text-subtitle-1 font-weight-bold px-0">
                        {{ $t("identifierConfigurationLabel") }}
                    </v-card-title>
                    <v-card-subtitle class="px-0 mb-5">
                        {{ $t("identifierConfigurationDescriptionLabel") }}
                    </v-card-subtitle>

                    <div
                        v-for="group in identifierGroups"
                        :key="group.entityType"
                        class="mb-6">
                        <div class="text-lg font-medium font-weight-bold mb-2 ml-2">
                            {{ $t(group.labelKey) }}
                        </div>

                        <div class="identifier-matrix">
                            <v-table density="compact">
                                <thead>
                                    <tr>
                                        <th>{{ $t("identifierLabel") }}</th>
                                        <th class="text-center">
                                            {{ $t("hideWhenNotSetLabel") }}
                                        </th>
                                        <th class="text-center">
                                            {{ $t("featuredIdentifierLabel") }}
                                        </th>
                                        <th class="text-center">
                                            {{ $t("canBeUpdatedLabel") }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="identifier in group.identifiers"
                                        :key="`${group.entityType}-${identifier}`">
                                        <td>{{ identifier }}</td>
                                        <td class="text-center">
                                            <v-checkbox
                                                :model-value="policyOf(group.entityType, identifier)
                                                    .hideWhenNotSet"
                                                hide-details
                                                density="compact"
                                                class="d-inline-flex"
                                                @update:model-value="value => setPolicy(
                                                    group.entityType, identifier,
                                                    'hideWhenNotSet', value)"
                                            />
                                        </td>
                                        <td class="text-center">
                                            <v-checkbox
                                                :model-value="policyOf(group.entityType, identifier)
                                                    .featured"
                                                hide-details
                                                density="compact"
                                                class="d-inline-flex"
                                                @update:model-value="value => setPolicy(
                                                    group.entityType, identifier,
                                                    'featured', value)"
                                            />
                                        </td>
                                        <td class="text-center">
                                            <v-checkbox
                                                :model-value="policyOf(group.entityType, identifier)
                                                    .canBeUpdated"
                                                hide-details
                                                density="compact"
                                                class="d-inline-flex"
                                                @update:model-value="value => setPolicy(
                                                    group.entityType, identifier,
                                                    'canBeUpdated', value)"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>
                    </div>
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
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Toast from '@/components/core/Toast.vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useGlobalLoading } from '@/composables/useGlobalLoading';
import { useLanguageTags } from '@/composables/useLanguageTags';
import CrisContextInformationService from '@/services/CrisContextInformationService';
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';
import { ApplicableEntityType, type CrisContextInformation, type IdentifierConfiguration,
    type IdentifierConfigurationMatrix, type MultilingualContent } from '@/models/Common';
import { License } from '@/models/DocumentFileModel';
import { getLicenseTitleFromValueAutoLocale, getLisenseTypesForGivenLocale } from '@/i18n/license';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';


const IDENTIFIER_GROUP_LABELS: { entityType: ApplicableEntityType, labelKey: string }[] = [
    { entityType: ApplicableEntityType.PERSON, labelKey: "personLabel" },
    { entityType: ApplicableEntityType.ORGANISATION_UNIT, labelKey: "organisationUnitLabel" },
    { entityType: ApplicableEntityType.DOCUMENT, labelKey: "documentLabel" }
];

const DEFAULT_POLICY: IdentifierConfiguration = {
    hideWhenNotSet: true, featured: false, canBeUpdated: true
};


export default defineComponent({
    name: "CrisContextInformationView",
    components: { Toast, MultilingualTextInput },
    setup() {
        const isFormValid = ref(false);
        const snackbar = ref(false);

        const i18n = useI18n();
        const { showLoader } = useGlobalLoading();
        const { crisContextInformation } = useCrisContextInformation();
        const { languageTags } = useLanguageTags();

        const licenseTypes = getLisenseTypesForGivenLocale();

        const toggleAssessmentModule = ref(true);
        const toggleDigitalLibrary = ref(true);
        const toggleDigitalRepository = ref(true);
        const toggleRegistration = ref(false);
        const personNationalIdRegularExpression = ref(".*");
        const projectNationalIdRegularExpression = ref(".*");
        const organisationUnitNationalIdRegularExpression = ref(".*");
        const documentNationalIdRegularExpression = ref(".*");
        const nationalIdentifierName = ref<MultilingualContent[]>([]);
        const identifierConfiguration = ref<IdentifierConfigurationMatrix>({});
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

        const identifierGroups = computed(() => IDENTIFIER_GROUP_LABELS
            .filter(group => !!identifierConfiguration.value[group.entityType])
            .map(group => ({
                ...group,
                identifiers: Object.keys(identifierConfiguration.value[group.entityType] ?? {})
            })));

        const policyOf = (entityType: ApplicableEntityType, identifier: string) =>
            identifierConfiguration.value[entityType]?.[identifier] ?? DEFAULT_POLICY;

        const setPolicy = (entityType: ApplicableEntityType, identifier: string,
            field: keyof IdentifierConfiguration, value: boolean | null) => {
            const perEntityType = identifierConfiguration.value[entityType];

            if (!perEntityType?.[identifier]) {
                return;
            }

            perEntityType[identifier] = { ...perEntityType[identifier], [field]: !!value };
        };

        const applyConfiguration = (configuration: CrisContextInformation) => {
            toggleAssessmentModule.value = configuration.toggleAssessmentModule;
            toggleDigitalLibrary.value = configuration.toggleDigitalLibrary;
            toggleDigitalRepository.value = configuration.toggleDigitalRepository;
            toggleRegistration.value = configuration.toggleRegistration;
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
            nationalIdentifierName.value = configuration.nationalIdentifierName ?? [];
            // A copy, so the checkboxes do not move the shared configuration before a save.
            identifierConfiguration.value = JSON.parse(
                JSON.stringify(configuration.identifierConfiguration ?? {}));
        };

        watch(crisContextInformation, applyConfiguration, { immediate: true });

        const submit = () => {
            const configuration: CrisContextInformation = {
                toggleAssessmentModule: toggleAssessmentModule.value,
                toggleDigitalLibrary: toggleDigitalLibrary.value,
                toggleDigitalRepository: toggleDigitalRepository.value,
                toggleRegistration: toggleRegistration.value,
                personNationalIdRegularExpression: personNationalIdRegularExpression.value,
                projectNationalIdRegularExpression: projectNationalIdRegularExpression.value,
                organisationUnitNationalIdRegularExpression:
                    organisationUnitNationalIdRegularExpression.value,
                documentNationalIdRegularExpression: documentNationalIdRegularExpression.value,
                metadataLicense: selectedMetadataLicense.value.value,
                identifierConfiguration: identifierConfiguration.value,
                nationalIdentifierName: nationalIdentifierName.value,
                orcidLoginToggle: crisContextInformation.value.orcidLoginToggle
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
            crisContextInformation, languageTags, toMultilingualTextInput,
            nationalIdentifierName, identifierGroups, policyOf, setPolicy,
            licenseTypes, selectedMetadataLicense,
            requiredSelectionRules, regularExpressionRules,
            toggleAssessmentModule,
            toggleDigitalLibrary,
            toggleDigitalRepository,
            toggleRegistration,
            personNationalIdRegularExpression,
            projectNationalIdRegularExpression,
            organisationUnitNationalIdRegularExpression,
            documentNationalIdRegularExpression
        };
    }
});
</script>

<style scoped>
.identifier-matrix {
    overflow-x: auto;
}
</style>
