<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" :icon="edit ? 'mdi-file-edit-outline' : 'mdi-plus'"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ edit ? $t("updateInvolvementLabel") : $t("addInvolvementLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <person-involvement-form
                            ref="formRef" :edit="edit" :preset-involvement="presetInvolvement" @create="emitCreateToParent"
                            @update="emitUpdateToParent"></person-involvement-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!formRef?.isFormValid" @click="formRef?.saveInvolvement()">
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
import PersonInvolvementForm from "./PersonInvolvementForm.vue";
import type { Education, Employment, Membership } from "@/models/InvolvementModel";


export default defineComponent({
    name: "PersonInvolvementModal",
    components: { PersonInvolvementForm },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetInvolvement: {
            type: Object as PropType<Education | Membership | Employment | undefined>,
            default: undefined
        }
    },
    emits: ["update", "create"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const formRef = ref<typeof PersonInvolvementForm>();

        const emitUpdateToParent = (involvement: Education | Membership | Employment) => {
            emit("update", involvement)
            dialog.value = false;
        };

        const emitCreateToParent = (involvement: Education | Membership | Employment) => {
            emit("create", involvement)
            dialog.value = false;
        };

        return {dialog, formRef, emitCreateToParent, emitUpdateToParent};
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
