<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    density="compact" class="bottom-spacer" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ isUpdate ? $t("updateLabel") : $t("createNewIndicatorLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isUpdate ? $t("updateIndicatorLabel") : $t("createNewIndicatorLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <indicator-form ref="formRef" :preset-indicator="presetIndicator" in-modal @create="emitToParent"></indicator-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" @click="formRef?.submit(true)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { type PropType, ref } from "vue";
import { defineComponent } from "vue";
import IndicatorForm from "./IndicatorForm.vue";
import type { IndicatorRequest, IndicatorResponse } from "@/models/AssessmentModel";


export default defineComponent({
    name: "IndicatorModal",
    components: { IndicatorForm },
    props: {
        isUpdate: {
            type: Boolean,
            default: false
        },
        presetIndicator: {
            type: Object as PropType<IndicatorResponse | undefined>,
            default: undefined
        }
    },
    emits: ["create", "update"],
    setup(props, { emit }) {
        const dialog = ref(false);

        const formRef = ref<typeof IndicatorForm>();

        const emitToParent = (indicator: IndicatorRequest) => {
            if (props.isUpdate) {
                emit("update", indicator);
            } else {
                emit("create", indicator);
            }
            
            dialog.value = false;
        }

        return {dialog, formRef, emitToParent};
    }
});
</script>
