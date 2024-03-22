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
                <v-row>
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
                <v-row>
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
            </v-col>
        </v-row>

        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ $t("savedMessage") }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
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
import { toMultilingualTextInput } from "@/i18n/TranslationUtil";
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';

export default defineComponent({
    name: "ConferenceSubmissionForm",
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
    },
    emits: ["create", "update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const i18n = useI18n();
        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
            if(props.edit && props.presetDocumentFile) {
                    file.value.push(new File([], props.presetDocumentFile.fileName));
                    selectedLicense.value = { title: licenses.find(license => getNameFromOrdinal(License, license.value) === props.presetDocumentFile?.license.toString())?.title as string, value: props.presetDocumentFile.license };
                    selectedResourceType.value = { title: resourceTypes.value.find(resourceType => getNameFromOrdinal(ResourceType, resourceType.value) === props.presetDocumentFile?.resourceType.toString())?.title as string, value: props.presetDocumentFile.resourceType };
            } 
        });

        const file = ref<File[]>([]);

        const description = ref([]);
        const descriptionRef = ref<typeof MultilingualTextInput>();
        
        const selectionPlaceholder: { title: string, value: any } = { title: "", value: null };
        const resourceTypes = computed(() => i18n.locale.value === "sr" ? resourceTypeSr : resourceTypeEn);
        const selectedResourceType = ref(selectionPlaceholder);

        const licenses = [
            { title: "BSD", value: License.BSD },
            { title: "Creative Commons", value: License.CREATIVE_COMMONS },
            { title: "Apache", value: License.APACHE },
            { title: "Open Access", value: License.OPEN_ACCESS },
        ];

        const selectedLicense = ref({ title: "Open Access", value: License.OPEN_ACCESS });

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const addDocumentFile = () => {

            const newDocumentFile: DocumentFile = {
                file: file.value![0],
                description: description.value,
                resourceType: selectedResourceType.value.value,
                license: selectedLicense.value.value
            }

            if(props.edit) {
                emit("update", newDocumentFile);
            } else {
                emit("create", newDocumentFile);
            }
            
        };

        return {isFormValid, snackbar, file,
            description, descriptionRef,
            requiredFieldRules, licenses, resourceTypes,
            selectedLicense, selectedResourceType,
            addDocumentFile, requiredSelectionRules, 
            languageTags, toMultilingualTextInput
        };
    }
});
</script>
