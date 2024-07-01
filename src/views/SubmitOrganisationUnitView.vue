<template>
    <v-container>
        <v-sheet class="text-center">
            <h1>{{ $t("addOULabel") }}</h1>
        </v-sheet>
        <br />
        <br />
        <organisation-unit-submission-form ref="submissionFormRef"></organisation-unit-submission-form>
        <v-row justify="center">
            <v-col cols="1">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitOU(false)">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-col>
            <v-col cols="3">
                <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" class="submission-action" @click="submissionFormRef?.submitOU(true)">
                    {{ $t("saveAndAddAnotherLabel") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import OrganisationUnitSubmissionForm from "@/components/organisationUnit/OrganisationUnitSubmissionForm.vue";
import { ref } from 'vue';

export default defineComponent({
    name: "SubmitOrganisationUnitView",
    components: {OrganisationUnitSubmissionForm},
    setup() {
        const submissionFormRef = ref<typeof OrganisationUnitSubmissionForm>();

        return {
            submissionFormRef
        };
    }
});
</script>