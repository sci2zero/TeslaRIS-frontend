<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        v-if="!edit"
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-plus"></v-icon>
                    </v-btn>
                    <v-list-item
                        v-else v-bind="scope.props" :disabled="readOnly" class="inline-action"
                        v-on="scope.isActive">
                        <v-list-item-title>{{ $t("updatePrizeLabel") }}</v-list-item-title>
                    </v-list-item>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ edit ? $t("updatePrizeLabel") : $t("addPrizeLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <prize-form
                            ref="formRef" :edit="edit" :preset-prize="presetPrize" @create="emitCreateToParent"
                            @update="emitUpdateToParent"></prize-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" @click="formRef?.savePrize()">
                        {{ edit ? $t("updateLabel") : $t("saveLabel") }}
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
import PrizeForm from "./PrizeForm.vue";
import type { PrizeResponse, Prize } from "@/models/PersonModel";


export default defineComponent({
    name: "PrizeModal",
    components: { PrizeForm },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPrize: {
            type: Object as PropType<PrizeResponse | undefined>,
            default: undefined
        }
    },
    emits: ["update", "create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const formRef = ref<typeof PrizeForm>();

        const emitUpdateToParent = (prize: Prize) => {
            emit("update", prize)
            dialog.value = false;
        };

        const emitCreateToParent = (prize: Prize) => {
            emit("create", prize)
            dialog.value = false;
        };

        return {dialog, formRef, emitCreateToParent, emitUpdateToParent};
    }
});
</script>
