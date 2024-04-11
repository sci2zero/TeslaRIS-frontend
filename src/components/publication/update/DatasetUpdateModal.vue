<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateDatasetLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <dataset-update-form ref="updateFormRef" :preset-dataset="presetDataset" @update="emitToParent"></dataset-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updateDataset()">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Dataset } from "@/models/PublicationModel";
import DatasetUpdateForm from "@/components/publication/update/DatasetUpdateForm.vue";


export default defineComponent({
    name: "DatasetUpdateModal",
    components: { DatasetUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetDataset: {
            type: Object as PropType<Dataset | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof DatasetUpdateForm>();

        const emitToParent = (dataset: Dataset) => {
            emit("update", dataset)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>

<style scoped>
.edit-pen-container .edit-pen {
    top: 0px;
    right: 0px;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover .edit-pen {
    opacity: 0.3;
}

.edit-pen-container .edit-pen:hover {
    opacity: 1;
}
</style>
