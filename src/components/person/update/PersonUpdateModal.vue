<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
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
                    <span class="text-h5">{{ $t("updatePersonLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <person-update-form ref="updateFormRef" :preset-person="presetPerson" @update="emitToParent"></person-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updatePerson()">
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
import PersonUpdateForm from "./PersonUpdateForm.vue";
import type { PersonResponse, PersonalInfo } from "@/models/PersonModel";


export default defineComponent({
    name: "PersonUpdateModal",
    components: { PersonUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof PersonUpdateForm>();

        const emitToParent = (personalInfo: PersonalInfo) => {
            emit("update", personalInfo)
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent};
    }
});
</script>
