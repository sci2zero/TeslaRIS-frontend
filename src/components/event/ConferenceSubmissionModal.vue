<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" icon v-bind="scope.props" style="margin-bottom: 20px;"
                    :disabled="readOnly" v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addConferenceLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <conference-submission-form ref="submissionFormRef" in-modal @create="emitToParent"></conference-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.addConference(true)">
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
import ConferenceSubmissionForm from "@/components/event/ConferenceSubmissionForm.vue";
import type { Conference } from "@/models/EventModel";


export default defineComponent({
    name: "SubmitConferenceModal",
    components: { ConferenceSubmissionForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
    },
    emits: ["create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof ConferenceSubmissionForm>();

        const emitToParent = (conference: Conference) => {
            emit("create", conference)
            dialog.value = false;
        }

        return {dialog, submissionFormRef, emitToParent};
    }
});
</script>
