<template>
    <v-row class="d-flex flex-row justify-center mt-10">
        <v-btn color="blue darken-1" @click="deleteLeft">
            {{ $t("deleteLeftLabel") }}
        </v-btn>
        <delete-dropdown v-if="supportsForceDelete" @delete="forceDeleteLeft"></delete-dropdown>

        <v-btn color="blue darken-1" class="ml-2" @click="updateBoth">
            {{ $t("updateLabel") }}
        </v-btn>

        <v-btn color="blue darken-1" class="ml-2" @click="deleteRight">
            {{ $t("deleteRightLabel") }}
        </v-btn>
        <delete-dropdown v-if="supportsForceDelete" @delete="forceDeleteRight"></delete-dropdown>

        <persistent-question-dialog ref="dialogRef" :title="$t('areYouSureLabel')" :message="dialogMessage" @continue="completeForceDelete"></persistent-question-dialog>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ComparisonSide } from '@/models/MergeModel';
import DeleteDropdown from './DeleteDropdown.vue';
import PersistentQuestionDialog from './PersistentQuestionDialog.vue';


export default defineComponent({
    name: "ComparisonActions",
    components: { DeleteDropdown, PersistentQuestionDialog },
    props: {
        supportsForceDelete: {
            type: Boolean,
            default: false
        },
        leftWarningMessage: {
            type: String,
            default: ""
        },
        rightWarningMessage: {
            type: String,
            default: ""
        }
    },
    emits: ["delete", "update"],
    setup(props, { emit }) {
        const dialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = ref("");
        const side = ref(ComparisonSide.LEFT);

        const deleteLeft = () => {
            emit("delete", ComparisonSide.LEFT, false);
        };

        const deleteRight = () => {
            emit("delete", ComparisonSide.RIGHT, false);
        };

        const forceDeleteLeft = () => {
            side.value = ComparisonSide.LEFT;
            if (props.leftWarningMessage) {
                dialogMessage.value = props.leftWarningMessage;
                dialogRef.value?.toggle();
            } else {
                completeForceDelete();
            }
        };

        const forceDeleteRight = () => {
            side.value = ComparisonSide.RIGHT;
            if (props.rightWarningMessage) {
                dialogMessage.value = props.rightWarningMessage;
                dialogRef.value?.toggle();
            } else {
                completeForceDelete();
            }
        };

        const completeForceDelete = () => {
            emit("delete", side.value, true);
        };

        const updateBoth = () => {
            emit("update");
        };

        return { 
            deleteLeft, deleteRight, updateBoth,
            forceDeleteLeft, forceDeleteRight,
            dialogRef, completeForceDelete,
            dialogMessage
        };
    },
});
</script>
