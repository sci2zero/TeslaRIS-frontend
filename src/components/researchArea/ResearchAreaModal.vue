<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-btn
                    density="compact" class="bottom-spacer ml-3" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ isUpdate ? $t("updateResearchAreaLabel") : $t("createNewResearchAreaLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isUpdate ? $t("updateResearchAreaLabel") : $t("createNewResearchAreaLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <researchArea-form ref="updateFormRef" :preset-research-area="presetResearchArea" @create="emitToParent"></researchArea-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.submit()">
                        {{ isUpdate ? $t("updateLabel") : $t("saveLabel") }}
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
import ResearchAreaForm from "./ResearchAreaForm.vue";
import type { ResearchAreaRequest, ResearchAreaResponse } from "@/models/Common";


export default defineComponent({
    name: "ResearchAreaModal",
    components: { ResearchAreaForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetResearchArea: {
            type: Object as PropType<ResearchAreaResponse | undefined>,
            required: true
        },
        isUpdate: {
            type: Boolean,
            default: false
        }
    },
    emits: ["submit"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof ResearchAreaForm>();

        const emitToParent = (researchArea: ResearchAreaRequest) => {
            emit("submit", researchArea)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>
