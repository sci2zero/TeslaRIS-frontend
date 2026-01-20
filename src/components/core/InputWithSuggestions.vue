<template>
    <div class="input-with-suggestions">
        <!-- INPUT SLOT -->
        <slot></slot>

        <!-- SUGGESTIONS -->
        <div
            v-if="suggestions.length"
            :class="'d-flex flex-wrap ' + (spaceOutSuggestions ? 'mt-5' : 'suggestions')">
            <span
                v-for="(suggestion, index) in suggestions.filter(s => s)"
                :key="index"
                class="ml-2">
                <v-chip
                    v-if="!isSuggestionCurrentSetValue(suggestion)"
                    outlined
                    size="small"
                    @click="applySuggestion(suggestion)">
                    {{ suggestionLabel(suggestion) }}
                </v-chip>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'


export default defineComponent({
    name: "InputWithSuggestions",
    props: {
        inputValue: {
            type: Object as PropType<any>,
            required: true,
        },
        suggestions: {
            type: Array as PropType<any[]>,
            default: () => [],
        },
        applySuggestion: {
            type: Function as PropType<(suggestion: any) => void>,
            required: true,
        },
        suggestionLabel: {
            type: Function as PropType<(suggestion: any) => string>,
            required: true,
        },
        spaceOutSuggestions: {
            type: Boolean,
            required: false,
        }
    },
    emits: ["update:modelValue"],
    setup(props) {
        const isSuggestionCurrentSetValue = (suggestion: any): boolean => {
            if (!suggestion) {
                return false;
            }

            if (Array.isArray(props.inputValue)) {
                if (!Array.isArray(suggestion)) {
                    return props.inputValue.includes(suggestion);
                }

                if (props.inputValue.length !== suggestion.length) {
                    return false;
                }

                for (let i = 0; i < props.inputValue.length; i++) {
                    const inputItem = props.inputValue[i];
                    const suggestionItem = suggestion[i];

                    if (suggestionItem && typeof suggestionItem === "object" && "content" in suggestionItem) {
                        if (!inputItem || typeof inputItem !== "object" || !("content" in inputItem)) {
                            return false;
                        }
                        if (inputItem.content !== suggestionItem.content) {
                            return false;
                        }
                    } else {
                        if (inputItem !== suggestionItem) {
                            return false;
                        }
                    }
                }
                return true;
            } else if (props.inputValue && typeof props.inputValue === "object" && "value" in props.inputValue) {
                return props.inputValue["value"] === suggestion;
            }

            return props.inputValue === suggestion;
        };

        return {
            isSuggestionCurrentSetValue
        };
    }
})
</script>

<style lang="css" scoped>

.suggestions {
    margin-top: -15px;
}

</style>
