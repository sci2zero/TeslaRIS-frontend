<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" icon v-bind="scope.props" class="bottom-spacer"
                    :disabled="conference.value <= 0" v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addProceedingsLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <proceedings-submission-form ref="submissionFormRef" in-modal :conference="conference" @create="emitToParent"></proceedings-submission-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.submitProceedings(false)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref, type PropType } from "vue";
import { defineComponent } from "vue";
import ProceedingsSubmissionForm from "@/components/proceedings/ProceedingsSubmissionForm.vue";
import type { Proceedings } from "@/models/ProceedingsModel";


export default defineComponent({
    name: "SubmitProceedingsModal",
    components: { ProceedingsSubmissionForm },
    props: {
        conference: {
            type: Object as PropType<{title: string, value: number}>,
            default: () => ({ title: "", value: -1 })
        }
    },
    emits: ["create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const submissionFormRef = ref<typeof ProceedingsSubmissionForm>();

        const emitToParent = (proceedings: Proceedings) => {
            emit("create", proceedings)
            dialog.value = false;
        }

        return {dialog, submissionFormRef, emitToParent};
    }
});
</script>
