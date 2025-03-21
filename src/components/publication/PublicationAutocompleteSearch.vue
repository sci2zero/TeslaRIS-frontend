<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedDocumentPublication.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedDocumentPublication"
                :label="$t('documentLabel')"
                :items="documentPublications"
                :custom-filter="((): boolean => true)"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchDocuments($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedDocumentPublication.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { onMounted } from 'vue';
import { DocumentPublicationIndex } from '@/models/PublicationModel';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "PublicationAutocompleteSearch",
    props: {
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const searchPlaceholder = {title: "", value: -1};
        const i18n = useI18n();

        const documentPublications = ref<{ title: string; value: number; }[]>([]);
        const selectedDocumentPublication = ref<{ title: string, value: number }>(searchPlaceholder);

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
                    []
                ).then((response) => {
                    const listOfDocuments: { title: string, value: number }[] = [];
                    response.data.content.forEach((documentPublication: DocumentPublicationIndex) => {
                        listOfDocuments.push(
                            {
                                title: i18n.locale.value === "sr" ? documentPublication.titleSr : documentPublication.titleOther,
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

        return {
            documentPublications, selectedDocumentPublication, searchDocuments,
            sendContentToParent, clearInput
        };
    }
});
</script>
