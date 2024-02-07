<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" icon v-bind="scope.props" style="margin-bottom: 20px;"
                    v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addOULabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <organisation-unit-submission-form ref="submissionFormRef" in-modal></organisation-unit-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitOU(true)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import OrganisationUnitSubmissionForm from "@/components/organisationUnit/OrganisationUnitSubmissionForm.vue";


export default defineComponent({
    name: "SubmitOrganisationUnitModal",
    components: { OrganisationUnitSubmissionForm },
    setup() {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof OrganisationUnitSubmissionForm>();

        return {dialog, submissionFormRef};
    }
});
</script>
