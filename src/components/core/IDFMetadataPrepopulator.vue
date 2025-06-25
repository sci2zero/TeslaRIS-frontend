<template>
    <v-row>
        <v-col cols="11">
            <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            <p v-if="errorMessage" class="text-red">
                {{ errorMessage }} {{ harvestedDocumentType }}
            </p>
        </v-col>
        <v-col v-if="isLoading" cols="1">
            <v-progress-circular
                color="primary"
                indeterminate
                class="mt-3"
            ></v-progress-circular>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import { PublicationType } from '@/models/PublicationModel';
import MetadataPrepopulationService from '@/services/MetadataPrepopulationService';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "IDFMetadataPrepopulator",
    props: {
        documentType: {
            type: Object as PropType<PublicationType>,
            required: true
        }
    },
    emits: ["metadataFetched"],
    setup(props, { emit }) {
        const doi = ref("");

        const i18n = useI18n();
        const mismatchedTypesMessage = computed(() => i18n.t("mismatchedPublicationTypesMessage"));
        
        const errorMessage = ref("");
        const harvestedDocumentType = ref("");

        const isLoading = ref(false);

        const { doiValidationRules } = useValidationUtils();

        watch(doi, () => {
            errorMessage.value = "";
            if (doi.value && doiValidationRules[0](doi.value) === true) {
                isLoading.value = true;
                MetadataPrepopulationService.fetchMetadataForDoi(
                    doi.value
                ).then(response => {
                    isLoading.value = false;
                    if (response.data.documentPublicationType && response.data.documentPublicationType !== props.documentType) {
                        harvestedDocumentType.value = getPublicationTypeTitleFromValueAutoLocale(response.data.documentPublicationType) as string;
                        errorMessage.value = mismatchedTypesMessage.value;
                        return;
                    }

                    emit("metadataFetched", response.data)
                });
            }
        });

        return {
            doi, errorMessage,
            doiValidationRules,
            isLoading,
            harvestedDocumentType
        };
    }
});
</script>
