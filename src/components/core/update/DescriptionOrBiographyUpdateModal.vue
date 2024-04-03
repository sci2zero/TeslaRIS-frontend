<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isBiography ? $t("updateBiographyLabel") : $t("updateDescriptionLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <description-or-biography-update-form ref="updateFormRef" :preset-description-or-biography="presetDescriptionOrBiography" @update="emitToParent"></description-or-biography-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" @click="updateFormRef?.updateKeywords()">
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
import type { MultilingualContent } from "@/models/Common";
import type { PropType } from "vue";
import DescriptionOrBiographyUpdateForm from "./DescriptionOrBiographyUpdateForm.vue";


export default defineComponent({
    name: "DescriptionOrBiographyUpdateModal",
    components: { DescriptionOrBiographyUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        isBiography: {
            type: Boolean,
            default: false
        },
        presetDescriptionOrBiography: {
            type: Object as PropType<MultilingualContent[]>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof DescriptionOrBiographyUpdateForm>();

        const emitToParent = (keywords: MultilingualContent[]) => {
            emit("update", keywords)
            dialog.value = false;
        }

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
