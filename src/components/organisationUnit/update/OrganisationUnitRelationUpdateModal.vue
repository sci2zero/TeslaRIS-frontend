<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="900px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateOURelationLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <organisation-unit-relation-update-form :relations="relations"></organisation-unit-relation-update-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updateOURelations()">
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
import OrganisationUnitRelationUpdateForm from "./OrganisationUnitRelationUpdateForm.vue";
import type { OrganisationUnitRelationResponse, OrganisationUnitRelationRequest } from "@/models/OrganisationUnitModel";


export default defineComponent({
    name: "OrganisationUnitRelationUpdateModal",
    components: { OrganisationUnitRelationUpdateForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        relations: {
            type: Object as PropType<OrganisationUnitRelationResponse[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);

        const updateFormRef = ref<typeof OrganisationUnitRelationUpdateForm>();

        const emitToParent = (organisationUnit: OrganisationUnitRelationRequest) => {
            emit("update", organisationUnit)
            dialog.value = false;
        };

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
