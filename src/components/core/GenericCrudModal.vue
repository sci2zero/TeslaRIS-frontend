<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent :class="wide ? 'wide' : 'narrow'">
            <template #activator="scope">
                <div v-if="isSectionUpdate && !readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
                <v-btn
                    v-if="!isSectionUpdate && !readOnly && isSubmission"
                    color="primary" icon v-bind="scope.props" class="bottom-spacer"
                    v-on="scope.isActive">
                    <v-icon>mdi-pencil-plus-outline</v-icon>
                </v-btn>
                <v-btn
                    v-if="!isSectionUpdate && !readOnly && !isSubmission"
                    :color="primaryColor ? 'primary' : ''"
                    :density="primaryColor ? 'default' : 'compact'" class="bottom-spacer" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ isUpdate ? $t("update" + entityName + "Label") : $t("createNew" + entityName + "Label") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isUpdate || isSectionUpdate ? $t("update" + entityName + "Label") : $t("createNew" + entityName + "Label") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <component
                            :is="formComponent"
                            ref="formRef"
                            v-bind="formProps"
                            in-modal
                            @create="emitToParent"
                            @update="emitToParent"
                            @update-persist="emitToParentAndPersist"
                        />
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue darken-1"
                        @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="!disableSubmission"
                        color="blue darken-1"
                        :disabled="!formRef?.isFormValid"
                        @click="formRef?.submit(true)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script lang="ts">
import { type PropType, ref } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "GenericCrudModal",
    props: {
        isUpdate: {
            type: Boolean,
            default: false
        },
        isSectionUpdate: {
            type: Boolean,
            default: false
        },
        isSubmission: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        formComponent: {
            type: Object as PropType<any>,
            required: true
        },
        formProps: {
            type: Object as PropType<Record<string, any>>,
            default: () => ({})
        },
        entityName: {
            type: String,
            required: true
        },
        wide: {
            type: Boolean,
            default: false
        },
        primaryColor: {
            type: Boolean,
            default: false
        },
        disableSubmission: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "update", "updatePersist"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const formRef = ref<InstanceType<typeof props.formComponent>>();

        const emitToParent = (formData: any) => {
            if (props.isUpdate) {
                emit("update", formData);
            } else {
                emit("create", formData);
            }
            
            dialog.value = false;
        }

        const emitToParentAndPersist = (formData: any) => {
            emit("updatePersist", formData);
        }

        return { 
            dialog, formRef, emitToParent,
            emitToParentAndPersist
        };
    }
});
</script>

<style scoped>

.wide {
    width: 100%;
    max-width: 1500px;
}

.narrow {
    width: 100%;
    max-width: 700px;
}

</style>
