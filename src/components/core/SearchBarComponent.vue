<template>
    <v-card
        class="mx-auto"
        color="grey-lighten-3"
        max-width="400">
        <v-text-field
            v-model="searchInput"
            density="compact"
            variant="solo"
            :label="$t('searchBarPlaceholder')"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            @click:append-inner="onSearch"
        ></v-text-field>
    </v-card>
</template>

<script lang="ts">
import { ref } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent(
    {
        name: "SearchBarComponent",
        emits: ["search"],
        setup(props, {emit}) {
            const searchInput = ref("");

            const onSearch = () => {
                const tokens: string[] = searchInput.value.trim().split(" ");
                let searchParams = "";
                tokens.forEach(token => {
                    if (token !== "") {
                        searchParams += `tokens=${token}&`;
                    }
                });
                emit("search", searchParams.slice(0, -1));
            }

            return {searchInput, onSearch};
        }
    });
</script>
