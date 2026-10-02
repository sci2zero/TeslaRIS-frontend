<template>
    <div :class="rootClasses">
        <div :class="{ 'search-input-wrapper': isFeatured }">
            <v-text-field
                ref="searchField"
                v-model="searchInput"
                :density="isFeatured ? 'comfortable' : 'compact'"
                :variant="isFeatured ? 'outlined' : 'plain'"
                :class="inputClasses"
                :placeholder="resolvedPlaceholder"
                :aria-label="resolvedPlaceholder"
                persistent-placeholder
                single-line
                hide-details
                :center-affix="!isFeatured"
                :color="isFeatured ? (dark ? 'white' : 'black') : undefined"
                @keydown.enter="onSearch"
            >
                <template v-if="isFeatured" #append-inner>
                    <v-icon 
                        icon="mdi-magnify" 
                        :color="dark ? 'white' : 'black'" 
                        size="28"
                        class="search-icon"
                        :class="{ 'search-icon--light': !dark }"
                        @click="onSearch"
                    />
                </template>
                <template v-else #prepend-inner>
                    <v-icon
                        icon="mdi-magnify"
                        size="20"
                        class="search-bar-plain__icon"
                        @click="onSearch"
                    />
                </template>
            </v-text-field>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from "lodash";


export default defineComponent(
    {
        name: "SearchBarComponent",
        props: {
            presetSearchInput: {
                type: String,
                default: ""
            },
            dark: {
                type: Boolean,
                default: false
            },
            longerDelay: {
                type: Boolean,
                default: false
            },
            focusAutomatically: {
                type: Boolean,
                default: false
            },
            searchWhenTyping: {
                type: Boolean,
                default: true
            },
            transparent: {
                type: Boolean,
                default: true
            },
            size: {
                type: String,
                default: "medium",
                validator: (value: string) => ["small", "medium", "large"].includes(value)
            },
            variant: {
                type: String,
                default: "plain",
                validator: (value: string) => ["featured", "plain"].includes(value)
            },
            placeholder: {
                type: String,
                default: ""
            }
        },
        emits: ["search"],
        setup(props, { emit }) {
            const i18n = useI18n();
            const searchInput = ref("");
            const searchField = ref();
            const isFeatured = computed(() => props.variant === "featured");
            const resolvedPlaceholder = computed(() => props.placeholder || i18n.t("searchBarPlaceholder"));
            const rootClasses = computed(() => {
                if (!isFeatured.value) {
                    return [
                        "plain-field",
                        "search-bar-plain",
                        `search-bar-plain--${props.size}`
                    ];
                }

                return [
                    "search-card",
                    {
                        "search-card--light": !props.dark,
                        "search-card--transparent": props.transparent,
                        "search-card--solid": !props.transparent
                    },
                    `search-card--${props.size}`
                ];
            });
            const inputClasses = computed(() => {
                if (!isFeatured.value) {
                    return ["plain-field__control", "search-bar-plain__input"];
                }

                return [
                    "search-input",
                    {
                        "search-input--light": !props.dark
                    },
                    `search-input--${props.size}`
                ];
            });

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
                if (!props.searchWhenTyping) {
                    return;
                }

                onSearch();
            }, props.longerDelay ? 500 : 300)
        );

        const clearInput = () => {
            searchInput.value = "";
        };

        return {
            searchInput, onSearch,
            searchField, clearInput,
            isFeatured, resolvedPlaceholder,
            rootClasses, inputClasses
        };
    }
});
</script>

<style scoped>
@reference "@/assets/main.css";


.search-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 4px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    transition: all 0.3s ease;
    position: relative;
}

.search-card::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-radius: 25px;
    z-index: -1;
}

.search-card:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.4);
    transform: translateY(-3px);
}

.search-input-wrapper {
    position: relative;
}

.search-input {
    width: 100%;
}

.search-input :deep(.v-field) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.search-input :deep(.v-field__outline) {
    --v-field-border-opacity: 0 !important;
    border: none !important;
}

.search-input :deep(.v-field__outline__start) {
    border: none !important;
}

.search-input :deep(.v-field__outline__end) {
    border: none !important;
}

.search-input :deep(.v-field__outline__notch) {
    border: none !important;
}

.search-input :deep(.v-label) {
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    letter-spacing: 0.5px;
}

.search-input :deep(.v-field__input) {
    color: white !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    padding: 20px 24px !important;
    letter-spacing: 0.5px;
}

.search-input :deep(.v-field__input::placeholder),
.search-input :deep(input::placeholder) {
    color: rgba(255, 255, 255, 0.75) !important;
    font-weight: 500 !important;
    opacity: 1;
    text-overflow: ellipsis;
}

.search-icon {
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 12px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.search-icon:hover {
    transform: scale(1.15);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

/* Focus states - completely remove borders */
.search-input :deep(.v-field--focused .v-field__outline) {
    --v-field-border-opacity: 0 !important;
}

.search-input :deep(.v-field--focused .v-label) {
    color: rgba(255, 255, 255, 1) !important;
}

.search-input :deep(.v-field--focused .v-field__outline__start),
.search-input :deep(.v-field--focused .v-field__outline__end),
.search-input :deep(.v-field--focused .v-field__outline__notch) {
    border: none !important;
}

/* Remove any remaining borders when typing */
.search-input :deep(.v-field--variant-outlined .v-field__outline) {
    --v-field-border-opacity: 0 !important;
}

.search-input :deep(.v-field--variant-outlined .v-field__outline__start),
.search-input :deep(.v-field--variant-outlined .v-field__outline__end),
.search-input :deep(.v-field--variant-outlined .v-field__outline__notch) {
    border: none !important;
}

/* Responsive design */
@media (max-width: 768px) {
    .search-container {
        max-width: 95%;
        padding: 0 16px;
    }
    
    .search-card {
        border-radius: 20px;
        padding: 10px;
    }
    
    .search-input :deep(.v-field__input) {
        padding: 16px 20px !important;
        font-size: 16px !important;
    }
    
    .search-input :deep(.v-label) {
        font-size: 16px !important;
    }
}

/* Light theme styles when dark is false */
.search-card--light {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.search-card--light::before {
    background: linear-gradient(45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02));
}

.search-card--light:hover {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.15);
}

.search-input--light :deep(.v-label) {
    color: rgba(0, 0, 0, 0.9) !important;
}

.search-input--light :deep(.v-field__input) {
    color: black !important;
}

.search-input--light :deep(.v-field__input::placeholder),
.search-input--light :deep(input::placeholder) {
    color: rgba(0, 0, 0, 0.55) !important;
    font-weight: 500 !important;
}

.search-input--light :deep(.v-field--focused .v-label) {
    color: rgba(0, 0, 0, 1) !important;
}

.search-icon--light {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.search-icon--light:hover {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Solid (non-transparent) styles */
.search-card--solid {
    background: white;
    backdrop-filter: none;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card--solid::before {
    display: none;
}

.search-card--solid:hover {
    background: white;
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.search-card--solid.search-card--light {
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card--solid.search-card--light:hover {
    background: white;
    border-color: rgba(0, 0, 0, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Size variants */
.search-card--small {
    @apply max-w-sm rounded-2xl p-0.5 w-full;
}

.search-card--small .search-input :deep(.v-field__input) {
    @apply px-4 py-2! text-sm;
}

.search-card--small .search-input :deep(.v-label) {
    @apply text-sm;
}

.search-card--small .search-icon {
    @apply mr-2;
    width: 20px;
    height: 20px;
}

.search-card--medium {
    @apply max-w-2xl rounded-3xl p-1;
}

.search-card--large {
    @apply max-w-4xl rounded-3xl p-1.5;
}

.search-card--large .search-input :deep(.v-field__input) {
    @apply px-7 py-6 text-lg;
}

.search-card--large .search-input :deep(.v-label) {
    @apply text-lg;
}

.search-card--large .search-icon {
    @apply mr-4;
    width: 32px;
    height: 32px;
}

.search-input--small :deep(.v-field__input) {
    @apply px-4 py-3 text-sm;
}

.search-input--small :deep(.v-label) {
    @apply text-sm;
}

.search-input--medium :deep(.v-field__input) {
    @apply px-6 py-5 text-base;
}

.search-input--medium :deep(.v-label) {
    @apply text-base;
}

.search-input--large :deep(.v-field__input) {
    @apply px-7 py-6 text-lg;
}

.search-input--large :deep(.v-label) {
    @apply text-lg;
}

.search-bar-plain {
    width: 100%;
    max-width: 36rem;
}

.search-bar-plain--small {
    max-width: none;
}

.search-bar-plain--large {
    max-width: 42rem;
}

.search-bar-plain :deep(.v-field.v-field--variant-plain > .v-field__prepend-inner) {
    align-items: center;
    align-self: stretch;
    padding-top: 0;
    padding-bottom: 0;
    padding-inline-start: 0.85rem;
}

.search-bar-plain :deep(.v-field__input) {
    padding-inline-start: 0.35rem;
}

.search-bar-plain__icon {
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-bar-plain__icon:hover {
    color: #0f172a;
}
</style>
