<template>
    <v-container>
        <h1 class="d-flex flex-row justify-center">
            {{ $t("harvestDataLabel") }}
        </h1>
        <br />
        <v-row class="d-flex flex-row justify-center">
            <v-col cols="4">
                <date-picker
                    v-model="startDate"
                    :label="$t('startDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
            <v-col cols="4">
                <date-picker
                    v-model="endDate"
                    :label="$t('endDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
        </v-row>
        <v-row class="d-flex flex-row justify-center">
            <v-col cols="auto">
                <v-btn @click="startHarvest">
                    {{ $t("scanSourcesLabel") }}
                </v-btn>
            </v-col>
        </v-row>
        <v-container class="d-flex flex-row justify-center">
            <h2>{{ $t("documentsReadyForImportLabel") }}: {{ numberOfHarvestedDocuments }}</h2>
        </v-container>
        <v-row v-if="loading" class="d-flex flex-row justify-center" style="margin-top: 50px;">
            <v-progress-circular
                :size="70"
                :width="7"
                color="blue"
                indeterminate
            ></v-progress-circular>
        </v-row>
        <v-container v-if="harvestComplete" class="d-flex flex-row justify-center">
            <h2 v-if="newDocumentsHarvested > 0">
                {{ $t("newlyImportedDocumentsCountLabel") }}: {{ newDocumentsHarvested }}
            </h2>
            <h2 v-else>
                {{ $t("noNewDocumentsMessage") }}
            </h2>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import DatePicker from "@/components/core/DatePicker.vue";
import ImportService from "@/services/ImportService";
import { onMounted } from "vue";

export default defineComponent({
    name: "HarvesterView",
    components: {DatePicker},
    setup() {
        const startDate = ref();
        const endDate = ref();
        const loading = ref(false);
        const harvestComplete = ref(false);
        const numberOfHarvestedDocuments = ref(0);
        const newDocumentsHarvested = ref(0);

        onMounted(() => {
            fetchNumberOfHarvestedDocuments();

            // Fetch number of imported documents 10 seconds
            setInterval(fetchNumberOfHarvestedDocuments, 1000 * 10);
        });

        const fetchNumberOfHarvestedDocuments = () => {
            ImportService.getHarvestedDocumentsCound().then(response => {
                numberOfHarvestedDocuments.value = response.data;
            });
        };

        const startHarvest = () => {
            loading.value = true;
            ImportService.startHarvest(startDate.value, endDate.value).then(response => {
                loading.value = false;
                harvestComplete.value = true;
                newDocumentsHarvested.value = response.data;
                numberOfHarvestedDocuments.value += newDocumentsHarvested.value;
            });
        };

        return {
            startDate, endDate,
            loading, startHarvest,
            numberOfHarvestedDocuments,
            newDocumentsHarvested,
            harvestComplete
        };
    },
});
</script>