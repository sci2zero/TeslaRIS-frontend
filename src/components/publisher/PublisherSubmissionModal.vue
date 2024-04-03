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
                    <span class="text-h5">{{ $t("addPublisherLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <publisher-submission-form ref="submissionFormRef" in-modal @create="emitToParent"></publisher-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitPublisher(true)">
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
import PublisherSubmissionForm from "@/components/publisher/PublisherSubmissionForm.vue";
import type { Publisher } from "@/models/PublisherModel";


export default defineComponent({
    name: "SubmitPublisherModal",
    components: { PublisherSubmissionForm },
    emits: ["create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof PublisherSubmissionForm>();

        const emitToParent = (publisher: Publisher) => {
            emit("create", publisher)
            dialog.value = false;
        }

        return {dialog, submissionFormRef, emitToParent};
    }
});
</script>
