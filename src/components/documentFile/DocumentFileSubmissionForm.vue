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
                            ref="descriptionRef" v-model="description" :initial-value="toMultilingualTextInput(presetDocumentFile?.description, languageTags)" is-area
                            :label="$t('descriptionLabel')"></multilingual-text-input>
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
                            v-model="selectedLicense"
                            :items="licenses"
                            :label="$t('licenseLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-checkbox v-model="isOpenAccess" :label="$t('isOpenAccessLabel')"></v-checkbox>
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
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { DocumentFile, DocumentFileResponse } from '@/models/DocumentFileModel';
import { resourceTypeSr, resourceTypeEn } from "@/i18n/resourceType";
import { License, ResourceType } from "@/models/DocumentFileModel";
import type { PropType } from 'vue';
import { onMounted } from 'vue';
import { getNameFromOrdinal } from '@/utils/EnumUtil';
import { toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';

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
        }
    },
    emits: ["create", "update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const i18n = useI18n();
        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            
            if(props.edit && props.presetDocumentFile) {
                    file.value = new File([], props.presetDocumentFile.fileName);
                    selectedLicense.value = { title: licenses.find(license => getNameFromOrdinal(License, license.value) === props.presetDocumentFile?.license.toString())?.title as string, value: props.presetDocumentFile.license };

                    if (props.presetDocumentFile.license.toString() !== "OPEN_ACCESS") {
                        isOpenAccess.value = false;
                    }

                    selectedResourceType.value = { title: resourceTypes.value.find(resourceType => getNameFromOrdinal(ResourceType, resourceType.value) === props.presetDocumentFile?.resourceType.toString())?.title as string, value: props.presetDocumentFile.resourceType };
            } 
        });

        const file = ref<File>();

        const description = ref([]);
        const descriptionRef = ref<typeof MultilingualTextInput>();
        
        const selectionPlaceholder: { title: string, value: any } = { title: "", value: null };
        const resourceTypes = computed(() => i18n.locale.value === "sr" ? resourceTypeSr : resourceTypeEn);
        const selectedResourceType = ref(selectionPlaceholder);

        const licenses = [
            { title: "Creative Commons", value: License.CREATIVE_COMMONS },
            { title: "Embargoed Access", value: License.EMBARGOED_ACCESS },
            { title: "Public Domain", value: License.PUBLIC_DOMAIN },
            { title: "Open Access", value: License.OPEN_ACCESS },
            { title: "All Rights Reserved", value: License.ALL_RIGHTS_RESERVED },
            { title: "Subscription-Based Access", value: License.SUBSCRIPTION_BASED_ACCESS },
        ];

        const selectedLicense = ref({ title: "All Rights Reserved", value: License.ALL_RIGHTS_RESERVED });
        const isOpenAccess = ref<boolean>(true);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const addDocumentFile = () => {
            const newDocumentFile: DocumentFile = {
                file: file.value as File,
                description: description.value,
                resourceType: selectedResourceType.value.value != null ? selectedResourceType.value.value : ResourceType.SUPPLEMENT,
                license: License.ALL_RIGHTS_RESERVED
            }

            if (props.allowLicenceSelection) {
                newDocumentFile.license = selectedLicense.value.value;
            } else {
                newDocumentFile.license = isOpenAccess.value ? License.OPEN_ACCESS : License.SUBSCRIPTION_BASED_ACCESS;
            }

            if(props.edit) {
                emit("update", newDocumentFile);
            } else {
                emit("create", newDocumentFile);
            }
            
        };

        return {isFormValid, file,
            description, descriptionRef, isOpenAccess,
            requiredFieldRules, licenses, resourceTypes,
            selectedLicense, selectedResourceType,
            addDocumentFile, requiredSelectionRules, 
            languageTags, toMultilingualTextInput
        };
    }
});
</script>
