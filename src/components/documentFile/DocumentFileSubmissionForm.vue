<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-file-input
                        v-model="file"
                        :label="$t('fileLabel') + '*'"
                        accept=".pdf,image/*"
                    ></v-file-input>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="descriptionRef" v-model="description"
                            :initial-value="toMultilingualTextInput(presetDocumentFile?.description, languageTags)"
                            is-area
                            :label="$t('descriptionLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row v-if="!isProof && !disableResourceTypeSelection">
                    <v-col>
                        <v-select
                            v-model="selectedResourceType"
                            :items="resourceTypes"
                            :label="$t('resourceTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row v-if="allowLicenceSelection">
                    <v-col>
                        <v-select
                            v-model="selectedAccessRight"
                            :items="accessRights"
                            :label="$t('licenseLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row v-else-if="!alwaysOpenAccess">
                    <v-checkbox
                        v-model="isOpenAccess"
                        :label="$t('isOpenAccessLabel')"
                    />
                </v-row>
                <v-row v-if="isOpenAccess && !alwaysOpenAccess">
                    <v-col>
                        <v-select
                            v-model="selectedCCLicense"
                            :items="cclicenseTypes"
                            :label="$t('ccLicenseLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
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
import { defineComponent } from 'vue';
import { ref } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { computed } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { DocumentFile, DocumentFileResponse } from '@/models/DocumentFileModel';
import { AccessRights, License, ResourceType } from "@/models/DocumentFileModel";
import type { PropType } from 'vue';
import { onMounted } from 'vue';
import { getNameFromOrdinal } from '@/utils/EnumUtil';
import { toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';
import { getLicenseTitleFromValueAutoLocale, getLisenseTypesForGivenLocale } from '@/i18n/license';
import { getResourceTypesForGivenLocale } from '@/i18n/resourceType';

export default defineComponent({
    name: "DocumentFileSubmissionForm",
    components: {MultilingualTextInput},
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        presetDocumentFile: {
            type: Object as PropType<DocumentFileResponse>,
            default: undefined
        },
        isProof: {
            type: Boolean,
            default: false
        },
        allowLicenceSelection: {
            type: Boolean,
            default: false
        },
        disableResourceTypeSelection: {
            type: Boolean,
            default: false
        },
        alwaysOpenAccess: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);

        const cclicenseTypes = getLisenseTypesForGivenLocale();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            
            if(props.edit && props.presetDocumentFile) {
                file.value = new File([], props.presetDocumentFile.fileName);
                selectedAccessRight.value = { title: accessRights.find(accessRights => getNameFromOrdinal(License, accessRights.value) === props.presetDocumentFile?.accessRights.toString())?.title as string, value: props.presetDocumentFile.accessRights };

                if (props.presetDocumentFile.accessRights.toString() === "OPEN_ACCESS") {
                    isOpenAccess.value = true;
                    selectedCCLicense.value = { title: cclicenseTypes?.find(ccLicense => props.presetDocumentFile?.license == ccLicense.value)?.title as string, value: props.presetDocumentFile.license };
                }

                selectedResourceType.value = { title: resourceTypes.value?.find(resourceType => getNameFromOrdinal(ResourceType, resourceType.value) === props.presetDocumentFile?.resourceType.toString())?.title as string, value: props.presetDocumentFile.resourceType };
            }

            if (props.alwaysOpenAccess) {
                isOpenAccess.value = true;
                selectedAccessRight.value = { title: "Open Access", value: AccessRights.OPEN_ACCESS };
                selectedCCLicense.value = { title: getLicenseTitleFromValueAutoLocale(License.BY_NC_ND) as string, value: License.BY_NC_ND };
            }
        });

        const file = ref<File>();

        const description = ref([]);
        const descriptionRef = ref<typeof MultilingualTextInput>();
        
        const selectionPlaceholder: { title: string, value: any } = { title: "", value: null };
        const resourceTypes = computed(() => getResourceTypesForGivenLocale());
        const selectedResourceType = ref(selectionPlaceholder);

        const accessRights = [
            { title: "Creative Commons", value: AccessRights.CREATIVE_COMMONS },
            { title: "Embargoed Access", value: AccessRights.EMBARGOED_ACCESS },
            { title: "Public Domain", value: AccessRights.PUBLIC_DOMAIN },
            { title: "Open Access", value: AccessRights.OPEN_ACCESS },
            { title: "All Rights Reserved", value: AccessRights.ALL_RIGHTS_RESERVED },
            { title: "Restricted Access", value: AccessRights.RESTRICTED_ACCESS },
        ];

        const selectedAccessRight = ref({ title: "All Rights Reserved", value: AccessRights.ALL_RIGHTS_RESERVED });
        const selectedCCLicense = ref({ title: getLicenseTitleFromValueAutoLocale(License.BY) as string, value: License.BY });
        const isOpenAccess = ref<boolean>(false);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const addDocumentFile = () => {
            const newDocumentFile: DocumentFile = {
                file: file.value as File,
                description: description.value,
                resourceType: selectedResourceType.value.value != null ? selectedResourceType.value.value : ResourceType.SUPPLEMENT,
                accessRights: AccessRights.ALL_RIGHTS_RESERVED,
                license: selectedCCLicense.value.value
            }

            if (props.allowLicenceSelection) {
                newDocumentFile.accessRights = selectedAccessRight.value.value;
            } else {
                newDocumentFile.accessRights = isOpenAccess.value ? AccessRights.OPEN_ACCESS : AccessRights.RESTRICTED_ACCESS;
            }

            if(props.edit) {
                emit("update", newDocumentFile);
            } else {
                emit("create", newDocumentFile);
            }
            
        };

        return {
            isFormValid, file, ResourceType, cclicenseTypes,
            description, descriptionRef, isOpenAccess,
            requiredFieldRules, accessRights, resourceTypes,
            selectedAccessRight, selectedResourceType,
            addDocumentFile, requiredSelectionRules, 
            languageTags, toMultilingualTextInput,
            selectedCCLicense
        };
    }
});
</script>
