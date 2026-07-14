<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedDocumentPublication.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedDocumentPublication"
                :label="label ? $t(label) : $t('documentLabel')"
                :items="readonly ? [] : documentPublications"
                :custom-filter="((): boolean => true)"
                :no-data-text="$t('noDataMessage')"
                :rules="required ? requiredSelectionRules : []"
                return-object
                @update:search="searchDocuments($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedDocumentPublication.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <generic-crud-modal
                v-if="allowCreation && allowedTypes.length == 1 && selectedDocumentPublication.value === -1"
                :form-component="getSubmissionFormBasedOnType()"
                :form-props="formProps"
                :entity-name="allowedTypes[0].toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()).replaceAll(' ', '')"
                is-submission
                @create="newDocumentCreated"
            />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { onMounted } from 'vue';
import { type Document, PublicationType, type DocumentPublicationIndex } from '@/models/PublicationModel';
import { useI18n } from 'vue-i18n';
import { useValidationUtils } from '@/utils/ValidationUtils';
import ThesisSubmissionForm from './ThesisSubmissionForm.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import JournalPublicationSubmissionForm from './JournalPublicationSubmissionForm.vue';
import ProceedingsPublicationSubmissionForm from './ProceedingsPublicationSubmissionForm.vue';
import PatentSubmissionForm from './PatentSubmissionForm.vue';
import ProceedingsSubmissionForm from '../proceedings/ProceedingsSubmissionForm.vue';
import IntangibleProductSubmissionForm from './IntangibleProductSubmissionForm.vue';
import MonographSubmissionForm from './MonographSubmissionForm.vue';
import MonographPublicationSubmissionForm from './MonographPublicationSubmissionForm.vue';
import MaterialProductSubmissionForm from './MaterialProductSubmissionForm.vue';
import GeneticMaterialSubmissionForm from './GeneticMaterialSubmissionForm.vue';
import PerformanceRelatedOutputSubmissionForm from './PerformanceRelatedOutputSubmissionForm.vue';


export default defineComponent({
    name: "PublicationAutocompleteSearch",
    components: { GenericCrudModal },
    props: {
        required: {
            type: Boolean,
            default: false
        },
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        allowCreation: {
            type: Boolean,
            default: false
        },
        allowedTypes: {
            type: Array as PropType<PublicationType[]>,
            default: () => []
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: undefined
        },
        formProps: {
            type: Object as PropType<Record<string, any>>,
            default: () => ({})
        },
        researcherId: {
            type: Number,
            default: undefined
        }
    },
    emits: ["update:modelValue", "create"],
    setup(props, {emit}) {
        const searchPlaceholder = {title: "", value: -1};
        const i18n = useI18n();

        const documentPublications = ref<{ title: string; value: number; }[]>([]);
        const selectedDocumentPublication = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredSelectionRules } = useValidationUtils();

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedDocumentPublication.value = props.modelValue;
            }
            sendContentToParent();
        });

        const searchDocuments = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";

                DocumentPublicationService.searchDocumentPublications(
                    params,
                    null,
                    false,
                    props.allowedTypes, 
                    null, null, undefined, null, null, null,
                    props.researcherId ? props.researcherId : null
                ).then((response) => {
                    const listOfDocuments: { title: string, value: number }[] = [];
                    response.data.content.forEach((documentPublication: DocumentPublicationIndex) => {
                        const displayTitle =
                            `${i18n.locale.value.startsWith("sr") ? documentPublication.titleSr : documentPublication.titleOther} (${documentPublication.authorNames}) ${documentPublication.year && documentPublication.year > 0 ? documentPublication.year : ""}`;

                        listOfDocuments.push(
                            {
                                title: displayTitle,
                                value: documentPublication.databaseId as number
                            }
                        );
                    })
                    documentPublications.value = listOfDocuments;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedDocumentPublication.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedDocumentPublication.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedDocumentPublication.value = searchPlaceholder;
            sendContentToParent();
        };

        const newDocumentCreated = (document: Document) => {
            emit("create", document);
        };

        const getSubmissionFormBasedOnType = () => {
            switch (props.allowedTypes[0]) {
                case PublicationType.JOURNAL_PUBLICATION:
                    return JournalPublicationSubmissionForm;
                case PublicationType.PROCEEDINGS_PUBLICATION:
                    return ProceedingsPublicationSubmissionForm;
                case PublicationType.PATENT:
                    return PatentSubmissionForm;
                case PublicationType.PROCEEDINGS:
                    return ProceedingsSubmissionForm;
                case PublicationType.INTANGIBLE_PRODUCT:
                    return IntangibleProductSubmissionForm;
                case PublicationType.MONOGRAPH:
                    return MonographSubmissionForm;
                case PublicationType.MONOGRAPH_PUBLICATION:
                    return MonographPublicationSubmissionForm;
                case PublicationType.THESIS:
                    return ThesisSubmissionForm;
                case PublicationType.MATERIAL_PRODUCT:
                    return MaterialProductSubmissionForm;
                case PublicationType.GENETIC_MATERIAL:
                    return GeneticMaterialSubmissionForm;
                case PublicationType.PERFORMANCE_RELATED_OUTPUT:
                    return PerformanceRelatedOutputSubmissionForm;
            }
        };

        return {
            documentPublications, selectedDocumentPublication, searchDocuments,
            sendContentToParent, clearInput, requiredSelectionRules,
            ThesisSubmissionForm, newDocumentCreated, getSubmissionFormBasedOnType
        };
    }
});
</script>
