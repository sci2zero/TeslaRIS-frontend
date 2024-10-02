<template>
    <v-row class="d-flex flex-row justify-center mt-10">
        <v-btn color="blue darken-1" @click="deleteLeft">
            {{ $t("deleteLeftLabel") }}
        </v-btn>
        <v-btn color="blue darken-1" class="ml-2" @click="updateBoth">
            {{ $t("updateLabel") }}
        </v-btn>
        <v-btn color="blue darken-1" class="ml-2" @click="deleteRight">
            {{ $t("deleteRightLabel") }}
        </v-btn>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ComparisonSide } from '@/models/MergeModel';


export default defineComponent({
    name: "ComparisonActions",
    emits: ["delete", "update"],
    setup(_, { emit }) {
        const deleteLeft = () => {
            emit("delete", ComparisonSide.LEFT);
        };

        const deleteRight = () => {
            emit("delete", ComparisonSide.RIGHT);
        };

        const updateBoth = () => {
            emit("update");
        };

        return { deleteLeft, deleteRight, updateBoth };
    },
});
</script>
