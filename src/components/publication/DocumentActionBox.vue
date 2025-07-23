<template>
    <div class="actions-box pa-4">
        <div class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("additionalActionsLabel") }}
        </div>

        <v-row dense>
            <v-col cols="12" sm="6" class="action-section">
                <div class="d-flex flex-row justify-start">
                    <citation-selector
                        ref="citationRef"
                        :document-id="documentId">
                    </citation-selector>
                    <v-btn
                        v-show="!metadataValid && canEdit && canValidate"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="validateMetadata">
                        {{ $t("validateMetadataLabel") }}
                    </v-btn>
                    <v-btn
                        v-show="!filesValid && canEdit && canValidate"
                        class="mb-5 ml-2" color="primary" density="compact"
                        variant="outlined"
                        @click="validateUploadedFiles">
                        {{ $t("validateUploadedFilesLabel") }}
                    </v-btn>
                </div>
            </v-col>
            <v-col cols="12" sm="6" class="action-section">
                <publication-badge-section
                    class="move-up"
                    :preloaded-doi="doi"
                    :document-id="documentId"
                    :description="description"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import { useUserRole } from '@/composables/useUserRole';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';


export default defineComponent({
    name: "DocumentActionBox",
    components: { CitationSelector, PublicationBadgeSection },
    props: {
        documentId: {
            type: Number,
            required: true
        },
        doi: {
            type: Object as PropType<string | undefined>,
            required: true
        },
        metadataValid: {
            type: Boolean,
            default: true
        },
        filesValid: {
            type: Boolean,
            default: true
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        description: {
            type: Object as PropType<string | null>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(props, {emit}) {
        const citationRef = ref<typeof CitationSelector>();

        const { isAdmin, isInstitutionalEditor, isInstitutionalLibrarian } = useUserRole();

        const canValidate = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value)

        const fetchCitations = () => {
            citationRef.value?.fetchCitations();
        };

        const validateMetadata = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentMetadata(
                props.documentId
            ).then(() => {
                emit("update");
            });
        };

        const validateUploadedFiles = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentFiles(
                props.documentId
            ).then(() => {
                emit("update");
            });
        };

        return {
            fetchCitations,
            canValidate,
            validateMetadata,
            validateUploadedFiles
        };
}})

</script>
