<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showOutputs"
                    :label="$t('showOutputsLabel')"
                />
            </v-col>
        </v-row>

        <v-expand-transition>
            <div v-if="showOutputs">
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="showBySpecifiedAffiliation"
                            :label="$t('showBySpecifiedAffiliationLabel')"
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="showByPublicationYearEmployments"
                            :label="$t('showByPublicationYearEmploymentsLabel')"
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="showByCurrentEmployments"
                            :label="$t('showByCurrentEmploymentsLabel')"
                        />
                    </v-col>
                </v-row>
            </div>
        </v-expand-transition>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import OrganisationUnitOutputConfigurationService from '@/services/OrganisationUnitOutputConfigurationService';
import type { OrganisationUnitOutputConfiguration } from '@/models/OrganisationUnitModel';


export default defineComponent({
    name: "OrganisationUnitOutputConfigurationForm",
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
                OrganisationUnitOutputConfigurationService.fetchConfigurationForOrganisationUnit(props.institutionId)
                .then(response => {
                    showOutputs.value = response.data.showOutputs;
                    showBySpecifiedAffiliation.value = response.data.showBySpecifiedAffiliation;
                    showByPublicationYearEmployments.value = response.data.showByPublicationYearEmployments;
                    showByCurrentEmployments.value = response.data.showByCurrentEmployments;
                });
            }
        };

        const showOutputs = ref(false);
        const showBySpecifiedAffiliation = ref(false);
        const showByPublicationYearEmployments = ref(false);
        const showByCurrentEmployments = ref(false);

        const submit = () => {
            const configuration: OrganisationUnitOutputConfiguration = {
                showOutputs: showOutputs.value,
                showBySpecifiedAffiliation: showBySpecifiedAffiliation.value,
                showByPublicationYearEmployments: showByPublicationYearEmployments.value,
                showByCurrentEmployments: showByCurrentEmployments.value
            };

            OrganisationUnitOutputConfigurationService.saveConfigurationForOrganisationUnit(
                props.institutionId, configuration
            ).then(response => {
                showOutputs.value = response.data.showOutputs;
                showBySpecifiedAffiliation.value = response.data.showBySpecifiedAffiliation;
                showByPublicationYearEmployments.value = response.data.showByPublicationYearEmployments;
                showByCurrentEmployments.value = response.data.showByCurrentEmployments;
                emit("update", showOutputs.value);
            });
        };

        return {
            isFormValid, submit, showOutputs,
            showBySpecifiedAffiliation,
            showByPublicationYearEmployments,
            showByCurrentEmployments
        };
    }
});
</script>
