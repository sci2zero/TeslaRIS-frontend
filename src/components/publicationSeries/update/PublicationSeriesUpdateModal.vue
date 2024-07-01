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
                    <span class="text-h5">{{ inputType === "0" ? $t("updateJournalLabel") : $t("updateBookSeriesLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <publication-series-update-form ref="updateFormRef" :input-type="inputType" :preset-publication-series="presetPublicationSeries" @update="emitToParent"></publication-series-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updatePublicationSeries()">
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
import PublicationSeriesUpdateForm from "./PublicationSeriesUpdateForm.vue";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";


export default defineComponent({
    name: "PublicationSeriesUpdateModal",
    components: { PublicationSeriesUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPublicationSeries: {
            type: Object as PropType<PublicationSeries | undefined>,
            required: true
        },
        inputType: {
            type: String,
            required: true
        },
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof PublicationSeriesUpdateForm>();

        const emitToParent = (publicationSeries: PublicationSeries) => {
            emit("update", publicationSeries)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>
