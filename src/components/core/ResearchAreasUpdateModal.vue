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
                    <span class="text-h5">{{ $t("updateResearchAreasLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <research-areas-selection
                        ref="researchAreasSelectionRef"
                        :research-areas-hierarchy="researchAreasHierarchy"
                        :limit-one="limitOne"
                        @update="emitToParent"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" @click="submitSelection">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { ResearchArea } from "@/models/OrganisationUnitModel";
import ResearchAreasSelection from "./ResearchAreasSelection.vue";


export default defineComponent({
    name: "ResearchAreasUpdateModal",
    components: { ResearchAreasSelection },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        researchAreasHierarchy: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        },
        limitOne: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();

        watch(dialog, () => {
            if (dialog.value) {
                researchAreasSelectionRef.value?.buildInitialSelection();
            }
        });

        const emitToParent = (researchAreaIds: number[]) => {
            emit("update", researchAreaIds)
            dialog.value = false;
        };

        const submitSelection = () => {
            researchAreasSelectionRef.value?.submitSelection();
        };

        return {
            dialog, emitToParent,
            submitSelection,
            researchAreasSelectionRef
        };
    }
});
</script>
