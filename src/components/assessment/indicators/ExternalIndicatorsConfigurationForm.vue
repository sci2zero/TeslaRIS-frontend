<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showAltmetric"
                    label="Altmetric"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showDimensions"
                    label="Dimensions"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showOpenCitations"
                    label="Open Citations"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showPlumX"
                    label="PlumX"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="showUnpaywall"
                    label="Unpaywall"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { ref } from 'vue';
import { type ExternalIndicatorConfiguration } from '@/models/AssessmentModel';
import ExternalIndicatorConfigurationService from '@/services/assessment/ExternalIndicatorConfigurationService';


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
                ExternalIndicatorConfigurationService.readConfigurationForInstitution(props.institutionId)
                .then(response => {
                    showAltmetric.value = response.data.showAltmetric;
                    showDimensions.value = response.data.showDimensions;
                    showOpenCitations.value = response.data.showOpenCitations;
                    showPlumX.value = response.data.showPlumX;
                    showUnpaywall.value = response.data.showUnpaywall;
                });
            }
        };

        const showAltmetric = ref(false);
        const showDimensions = ref(false);
        const showOpenCitations = ref(false);
        const showPlumX = ref(false);
        const showUnpaywall = ref(false);

        const submit = () => {
            const indicatorConfiguration: ExternalIndicatorConfiguration = {
                showAltmetric: showAltmetric.value,
                showDimensions: showDimensions.value,
                showOpenCitations: showOpenCitations.value,
                showPlumX: showPlumX.value,
                showUnpaywall: showUnpaywall.value
            };

            ExternalIndicatorConfigurationService.updateIndicatorConfiguration(indicatorConfiguration, props.institutionId)
            .then(() => {
                emit("update");
            });
        };

        return {
            isFormValid, submit,
            showAltmetric, showDimensions,
            showOpenCitations, showPlumX,
            showUnpaywall
        };
    }
});
</script>
