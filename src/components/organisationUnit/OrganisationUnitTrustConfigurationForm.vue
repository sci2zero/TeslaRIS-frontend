<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="doNotTrustNewPublications"
                    :label="$t('trustNewPublicationsLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="doNotTrustNewDocumentFiles"
                    :label="$t('trustNewDocumentFilesLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import type { OrganisationUnitTrustConfiguration } from '@/models/OrganisationUnitModel';


export default defineComponent({
    name: "ExternalIndicatorConfigurationForm",
    props: {
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        onMounted(() => {
            fetchDetails();
        });

        watch(() => props.institutionId, () => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.institutionId) {
                OrganisationUnitTrustConfigurationService.fetchConfigurationForOrganisationUnit(props.institutionId)
                .then(response => {
                    doNotTrustNewPublications.value = !response.data.trustNewPublications;
                    doNotTrustNewDocumentFiles.value = !response.data.trustNewDocumentFiles;
                });
            }
        };

        const doNotTrustNewPublications = ref(false);
        const doNotTrustNewDocumentFiles = ref(false);

        const submit = () => {
            const configuration: OrganisationUnitTrustConfiguration = {
                trustNewDocumentFiles: !doNotTrustNewDocumentFiles.value,
                trustNewPublications: !doNotTrustNewPublications.value
            };

            OrganisationUnitTrustConfigurationService.saveConfigurationForOrganisationUnit(
                props.institutionId, configuration
            ).then(response => {
                doNotTrustNewPublications.value = !response.data.trustNewPublications;
                doNotTrustNewDocumentFiles.value = !response.data.trustNewDocumentFiles;
                emit("update");
            });
        };

        return {
            isFormValid, submit,
            doNotTrustNewPublications,
            doNotTrustNewDocumentFiles
        };
    }
});
</script>
