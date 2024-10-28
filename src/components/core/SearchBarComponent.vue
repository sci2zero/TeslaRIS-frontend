<template>
    <v-card
        class="mx-auto"
        color="grey-lighten-3"
        max-width="400">
        <v-text-field
            v-model="searchInput"
            density="compact"
            variant="solo"
            class="pa-3"
            :label="$t('searchBarPlaceholder')"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            @click:append-inner="onSearch"
            @keydown.enter="onSearch"
        ></v-text-field>
    </v-card>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent(
    {
        name: "SearchBarComponent",
        props: {
            presetSearchInput: {
                type: String,
                default: ""
            }
        },
        emits: ["search"],
        setup(props, {emit}) {
            const searchInput = ref(props.presetSearchInput);

            onMounted(() => {
                if (props.presetSearchInput !== "") {
                    onSearch();
                }
            });

            const onSearch = () => {
                let tokens: string[] = searchInput.value.trim().split(" ");
                if (tokens.length === 1 && tokens[0] === "") {
                    tokens = ["*"]
                }
                
                let searchParams: string = "";
                let parsingPhrase = false;
                let currentToken = "";
                tokens.forEach(token => {
                    if (token === "") {
                        return;
                    }

                    if (token.startsWith('"')) {
                        parsingPhrase = true;
                    } else if (token.endsWith('"')) {
                        parsingPhrase = false;
                    }

                    currentToken += token;
                    if (!parsingPhrase) {
                        searchParams += `tokens=${encodeURIComponent(currentToken)}&`;
                        currentToken = "";
                    } else {
                        currentToken += " ";
                    }
                });
                emit("search", searchParams.slice(0, -1));
            };

            return {searchInput, onSearch};
        }
    });
</script>
