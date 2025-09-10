<template>
    <v-card
        class="mx-auto"
        color="grey-lighten-3"
        max-width="400">
        <v-text-field
            ref="searchField"
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
import { onMounted, watch, ref } from 'vue';
import { defineComponent } from 'vue';
import lodash from "lodash";


export default defineComponent({
    name: "SearchBarComponent",
    props: {
        presetSearchInput: {
            type: String,
            default: ""
        },
        longerDelay: {
            type: Boolean,
            default: false
        },
        focusAutomatically: {
            type: Boolean,
            default: false
        }
    },
    emits: ["search"],
    setup(props, { emit }) {
        const searchInput = ref("");
        const searchField = ref();

        const onSearch = () => {
            if (searchInput.value === undefined) {
                return;
            }

            let tokens: string[] = searchInput.value.trim().split(" ");
            if ((tokens.length === 1 && tokens[0] === "")) {
                tokens = ["*"];
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

        onMounted(() => {
            if (props.presetSearchInput !== "") {
                onSearch();
            }

            if (props.focusAutomatically && searchField.value?.$el) {
                const inputEl = searchField.value.$el.querySelector("input");
                if (inputEl) {
                    inputEl.focus();

                    const val = inputEl.value;
                    inputEl.setSelectionRange(val.length, val.length);
                }
            }
        });

        watch(() => props.presetSearchInput, () => {
            if (props.presetSearchInput !== "" && props.presetSearchInput !== "*") {
                searchInput.value = props.presetSearchInput;
            }
        });

        watch(
            searchInput,
            lodash.debounce(() => {
                onSearch();
            }, props.longerDelay ? 500 : 300)
        );

        const clearInput = () => {
            searchInput.value = "";
        };

        return {
            searchInput, onSearch,
            searchField, clearInput
        };
    }
});
</script>
