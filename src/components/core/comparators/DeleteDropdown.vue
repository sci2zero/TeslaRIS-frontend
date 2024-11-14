<template>
    <v-menu>
        <template #activator="{ props, isActive }">
            <v-btn
                color="primary"
                v-bind="props"
            >
                {{ isActive ? "▲" : "▼" }}
            </v-btn>
        </template>
        <v-list>
            <v-list-item @click="performDelete">
                <v-list-item-title>{{ $t("forceDeleteLabel") }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
    name: "DeleteDropdown",
    emits: ["delete"],
    setup(_, { emit }) {
        const performDelete = () => {
            emit("delete");
        };

        return { 
            performDelete
        };
    },
});
</script>
