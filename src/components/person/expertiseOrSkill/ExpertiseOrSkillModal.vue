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
                    <!-- <v-list-item
                        v-else v-bind="scope.props" :disabled="readOnly" class="inline-action"
                        v-on="scope.isActive">
                        <v-list-item-title>{{ $t("updateExpertiseOrSkillLabel") }}</v-list-item-title>
                    </v-list-item> -->
                    <v-btn
                        v-else icon variant="outlined"
                        color="primary" v-bind="scope.props"
                        :disabled="readOnly" size="medium" v-on="scope.isActive">
                        <v-icon size="large" icon="mdi-pen"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ edit ? $t("updateExpertiseOrSkillLabel") : $t("addExpertiseOrSkillLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <expertise-or-skill-form
                            ref="formRef" :edit="edit" :preset-expertise-or-skill="presetExpertiseOrSkill" @create="emitCreateToParent"
                            @update="emitUpdateToParent"></expertise-or-skill-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" @click="formRef?.saveExpertiseOrSkill()">
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
import ExpertiseOrSkillForm from "./ExpertiseOrSkillForm.vue";
import type { ExpertiseOrSkillResponse, ExpertiseOrSkill } from "@/models/PersonModel";


export default defineComponent({
    name: "ExpertiseOrSkillModal",
    components: { ExpertiseOrSkillForm },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetExpertiseOrSkill: {
            type: Object as PropType<ExpertiseOrSkillResponse | undefined>,
            default: undefined
        }
    },
    emits: ["update", "create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const formRef = ref<typeof ExpertiseOrSkillForm>();

        const emitUpdateToParent = (expertiseOrSkill: ExpertiseOrSkill) => {
            emit("update", expertiseOrSkill)
            dialog.value = false;
        };

        const emitCreateToParent = (expertiseOrSkill: ExpertiseOrSkill) => {
            emit("create", expertiseOrSkill)
            dialog.value = false;
        };

        return {dialog, formRef, emitCreateToParent, emitUpdateToParent};
    }
});
</script>
