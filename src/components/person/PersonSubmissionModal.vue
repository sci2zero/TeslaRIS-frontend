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
                    <span class="text-h5">{{ $t("addPersonLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <person-submission-form ref="submissionFormRef" in-modal></person-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitPerson(true)">
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
import PersonSubmissionForm from "@/components/person/PersonSubmissionForm.vue";


export default defineComponent({
    name: "SubmitPersonModal",
    components: { PersonSubmissionForm },
    setup() {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof PersonSubmissionForm>();

        return {dialog, submissionFormRef};
    }
});
</script>
