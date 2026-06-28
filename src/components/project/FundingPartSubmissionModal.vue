<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!edit" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="primary" v-bind="scope.props" class="bottom-spacer ml-2!"
                        :disabled="readOnly" size="medium" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-plus"></v-icon>
                    </v-btn>
                </div>
                <v-btn
                    v-else icon variant="outlined"
                    color="primary" v-bind="scope.props" class="inline-edit-btn"
                    :disabled="readOnly" size="medium" v-on="scope.isActive">
                    <v-icon size="x-large" icon="mdi-pen"></v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ edit ? $t("updateLabel") : $t("addFundingPartLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <funding-part-submission-form
                            ref="submissionFormRef"
                            :edit="edit"
                            :preset-funding-part="presetFundingPart"
                            @create="emitCreateToParent"
                            @update="emitUpdateToParent"
                        />
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!submissionFormRef?.isFormValid" @click="submissionFormRef?.addFundingPart()">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FundingPartSubmissionForm from "@/components/project/FundingPartSubmissionForm.vue";
import type { FundingPart } from "@/models/FundingModel";

const props = defineProps<{
    edit?: boolean;
    readOnly?: boolean;
    presetFundingPart?: FundingPart;
}>();

const emit = defineEmits<{
    (e: "create", fundingPart: FundingPart): void;
    (e: "update", fundingPart: FundingPart): void;
}>();

const dialog = ref(false);

const submissionFormRef = ref<typeof FundingPartSubmissionForm>();

const emitCreateToParent = (fundingPart: FundingPart) => {
    emit("create", fundingPart);
    dialog.value = false;
};

const emitUpdateToParent = (fundingPart: FundingPart) => {
    emit("update", fundingPart);
    dialog.value = false;
};
</script>

<style scoped>

.inline-edit-btn {
    margin-top: 13px;
}

</style>