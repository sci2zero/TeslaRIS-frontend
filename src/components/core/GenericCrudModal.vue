<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
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
                    v-if="!isSectionUpdate && !readOnly"
                    density="compact" class="bottom-spacer" v-bind="scope.props"
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
                        />
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
        }
    },
    emits: ["create", "update"],
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

        return { dialog, formRef, emitToParent };
    }
});
</script>