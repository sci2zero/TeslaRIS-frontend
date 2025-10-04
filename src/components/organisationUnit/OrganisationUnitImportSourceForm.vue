<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-if="scopusConfigured">
            <v-col>
                <v-checkbox
                    v-model="importScopus"
                    label="Scopus"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="importOpenAlex"
                    label="OpenAlex"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row v-if="webOfScienceConfigured">
            <v-col>
                <v-checkbox
                    v-model="importWebOfScience"
                    label="Web of Science"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import type { OrganisationUnitImportSource } from '@/models/OrganisationUnitModel';
import OrganisationUnitImportSourceService from '@/services/importer/OrganisationUnitImportSourceService';


export default defineComponent({
    name: "OrganisationUnitImportSourceForm",
    props: {
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const scopusConfigured = ref(false);
        const webOfScienceConfigured = ref(false);

        onMounted(() => {
            fetchDetails();
        });

        watch(() => props.institutionId, () => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.institutionId) {
                OrganisationUnitImportSourceService.fetchConfigurationForOrganisationUnit(props.institutionId)
                .then(response => {
                    importScopus.value = response.data.importScopus;
                    importOpenAlex.value = response.data.importOpenAlex;
                    importWebOfScience.value = response.data.importWebOfScience;
                    scopusConfigured.value = response.data.scopusConfigured as boolean;
                    webOfScienceConfigured.value = response.data.webOfScienceConfigured as boolean;
                });
            }
        };

        const importScopus = ref(false);
        const importOpenAlex = ref(false);
        const importWebOfScience = ref(false);

        const submit = () => {
            const configuration: OrganisationUnitImportSource = {
                importScopus: importScopus.value,
                importOpenAlex: importOpenAlex.value,
                importWebOfScience: importWebOfScience.value
            };

            OrganisationUnitImportSourceService.saveConfigurationForOrganisationUnit(
                props.institutionId, configuration
            ).then(() => {
                emit("update");
            });
        };

        return {
            isFormValid, submit,
            importScopus, importOpenAlex,
            importWebOfScience, scopusConfigured,
            webOfScienceConfigured
        };
    }
});
</script>
