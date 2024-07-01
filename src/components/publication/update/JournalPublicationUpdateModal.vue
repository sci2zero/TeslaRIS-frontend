<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateJournalPublicationLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <journal-publication-update-form ref="updateFormRef" :preset-journal-publication="presetJournalPublication" @update="emitToParent"></journal-publication-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updateJournalPublication()">
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
import type { JournalPublication } from "@/models/PublicationModel";
import JournalPublicationUpdateForm from "./JournalPublicationUpdateForm.vue";


export default defineComponent({
    name: "JournalPublicationUpdateModal",
    components: { JournalPublicationUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetJournalPublication: {
            type: Object as PropType<JournalPublication | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof JournalPublicationUpdateForm>();

        const emitToParent = (journalPublication: JournalPublication) => {
            emit("update", journalPublication)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>
