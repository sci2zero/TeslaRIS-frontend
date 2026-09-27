<template>
    <div class="multi-lingual-input">
        <div v-if="label || unusedLanguages.length > 0" class="multi-lingual-input__header">
            <div v-if="label" class="multi-lingual-input__label">{{ label }}</div>
            <v-menu v-if="unusedLanguages.length > 0" location="bottom end">
                <template #activator="{ props: menuProps }">
                    <button
                        v-bind="menuProps"
                        type="button"
                        class="multi-lingual-input__add"
                    >
                        <span class="mdi mdi-plus"></span>
                        {{ $t("addLanguageLabel") }}
                    </button>
                </template>
                <v-list class="multi-lingual-input__menu" density="compact">
                    <v-list-item
                        v-for="language in unusedLanguages"
                        :key="language.value"
                        @click="addLanguage(language)"
                    >
                        <div class="multi-lingual-input__menu-row">
                            <span class="multi-lingual-input__flag multi-lingual-input__flag--menu">
                                <img
                                    v-if="flagUrl(language) && !failedFlags.has(language.title)"
                                    :src="flagUrl(language) as string"
                                    :alt="displayName(language)"
                                    @error="onFlagError(language.title)"
                                />
                                <span v-else>{{ languageInitials(language) }}</span>
                            </span>
                            <span>{{ displayName(language) }}</span>
                        </div>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <div
            v-for="(input, index) in orderedInputs"
            :key="input.language.value"
            class="multi-lingual-input__row"
            :class="{ 'is-follow': index > 0 }"
        >
            <div class="multi-lingual-input__field">
                <ui-input
                    v-if="!isRich"
                    v-model="input.text"
                    :control="isArea ? 'textarea' : 'text'"
                    :aria-label="label"
                    :rules="rowRules(input)"
                    @update:model-value="sendContentToParent"
                >
                    <template #prepend-inner>
                        <v-menu
                            :disabled="canRemove || unusedLanguages.length === 0"
                            location="bottom start"
                        >
                            <template #activator="{ props: menuProps }">
                                <button
                                    type="button"
                                    class="multi-lingual-input__lang"
                                    :class="{ 'is-primary': isPrimary(input) }"
                                    v-bind="canRemove || unusedLanguages.length === 0 ? {} : menuProps"
                                    :title="languageButtonTitle(input)"
                                    :aria-label="languageAriaLabel(input)"
                                    :aria-pressed="canRemove ? isPrimary(input) : undefined"
                                    @click="onLanguageClick(input)"
                                >
                                    <span class="multi-lingual-input__flag">
                                        <img
                                            v-if="flagUrl(input.language) && !failedFlags.has(input.language.title)"
                                            :src="flagUrl(input.language) as string"
                                            alt=""
                                            @error="onFlagError(input.language.title)"
                                        />
                                        <span v-else>{{ languageInitials(input.language) }}</span>
                                        <span
                                            v-if="canRemove"
                                            class="multi-lingual-input__star mdi"
                                            :class="isPrimary(input) ? 'mdi-star' : 'mdi-star-outline'"
                                            aria-hidden="true"
                                        ></span>
                                    </span>
                                    <span class="multi-lingual-input__lang-code">{{ input.language.title }}</span>
                                </button>
                            </template>
                            <v-list class="multi-lingual-input__menu" density="compact">
                                <v-list-item
                                    v-for="language in unusedLanguages"
                                    :key="language.value"
                                    @click="changeLanguage(input, language)"
                                >
                                    <div class="multi-lingual-input__menu-row">
                                        <span class="multi-lingual-input__flag multi-lingual-input__flag--menu">
                                            <img
                                                v-if="flagUrl(language) && !failedFlags.has(language.title)"
                                                :src="flagUrl(language) as string"
                                                :alt="displayName(language)"
                                                @error="onFlagError(language.title)"
                                            />
                                            <span v-else>{{ languageInitials(language) }}</span>
                                        </span>
                                        <span>{{ displayName(language) }}</span>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </ui-input>
                <template v-else>
                    <v-menu
                        :disabled="canRemove || unusedLanguages.length === 0"
                        location="bottom start"
                    >
                        <template #activator="{ props: menuProps }">
                            <button
                                type="button"
                                class="multi-lingual-input__lang"
                                :class="{ 'is-primary': isPrimary(input) }"
                                v-bind="canRemove || unusedLanguages.length === 0 ? {} : menuProps"
                                :title="languageButtonTitle(input)"
                                :aria-label="languageAriaLabel(input)"
                                :aria-pressed="canRemove ? isPrimary(input) : undefined"
                                @click="onLanguageClick(input)"
                            >
                                <span class="multi-lingual-input__flag">
                                    <img
                                        v-if="flagUrl(input.language) && !failedFlags.has(input.language.title)"
                                        :src="flagUrl(input.language) as string"
                                        alt=""
                                        @error="onFlagError(input.language.title)"
                                    />
                                    <span v-else>{{ languageInitials(input.language) }}</span>
                                    <span
                                        v-if="canRemove"
                                        class="multi-lingual-input__star mdi"
                                        :class="isPrimary(input) ? 'mdi-star' : 'mdi-star-outline'"
                                        aria-hidden="true"
                                    ></span>
                                </span>
                                <span class="multi-lingual-input__lang-code">{{ input.language.title }}</span>
                            </button>
                        </template>
                        <v-list class="multi-lingual-input__menu" density="compact">
                            <v-list-item
                                v-for="language in unusedLanguages"
                                :key="language.value"
                                @click="changeLanguage(input, language)"
                            >
                                <div class="multi-lingual-input__menu-row">
                                    <span class="multi-lingual-input__flag multi-lingual-input__flag--menu">
                                        <img
                                            v-if="flagUrl(language) && !failedFlags.has(language.title)"
                                            :src="flagUrl(language) as string"
                                            :alt="displayName(language)"
                                            @error="onFlagError(language.title)"
                                        />
                                        <span v-else>{{ languageInitials(language) }}</span>
                                    </span>
                                    <span>{{ displayName(language) }}</span>
                                </div>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <rich-text-editor
                        ref="richEditorRef"
                        v-model="input.text"
                        :default-placeholder="placeholderLabel"
                        @input="sendContentToParent"
                    />
                </template>
            </div>

            <button
                type="button"
                v-if="canRemove"
                class="multi-lingual-input__remove"
                :title="$t('removeLanguageLabel')"
                :aria-label="$t('removeLanguageLabel')"
                @click="removeLanguage(input)"
            ><span class="mdi mdi-close"></span></button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import { ref } from "vue";
import LanguageService from "@/services/LanguageService";
import { onMounted } from "vue";
import type { LanguageTagResponse, MultilingualContent } from "@/models/Common";
import type { AxiosResponse } from "axios";
import UserService from "@/services/UserService";
import type { UserResponse } from "@/models/UserModel";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import RichTextEditor from "./RichTextEditor.vue";
import UiInput from "@/components/ui/input/Input.vue";
import {
    getLanguageDisplayName,
    type FormLanguageOption
} from "@/composables/useFormLanguage";
import { getLanguageFlagUrl } from "@/utils/LanguageFlagUtil";


type LanguageChoice = FormLanguageOption;

type MultilingualInput = {
    language: LanguageChoice,
    text: string,
    priority: number,
    supportedLanguages: LanguageChoice[]
};

export default defineComponent({
    name: "MultilingualTextInput",
    components: { RichTextEditor, UiInput },
    props: {
        label: {
            type: String,
            required: true
        },
        isArea: {
            type: Boolean,
            required: false,
            default: false
        },
        isRich: {
            type: Boolean,
            required: false,
            default: false
        },
        rules: {
            type: Array as PropType<((value: string) => string | true)[]>,
            default: () => [],
        },
        modelValue: {
            type: Object as PropType<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[], priority: number }[] | undefined>,
            required: true,
        },
        initialValue: {
            type: Object as PropType<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[], priority: number }[] | undefined>,
            required: false,
            default: undefined
        },
        defaultPlaceholder: {
            type: String,
            default: ""
        },
        placeholderLabel: {
            type: String,
            default: ""
        }
    },
    emits: ["update:modelValue", "update"],
    setup(props, {emit}) {
        const { t } = useI18n();
        const userPreferredLanguage = ref<{tag: string, id: number}>({tag: "", id: -1});
        const supportedLanguages = ref<LanguageChoice[]>([]);
        const inputs = ref<MultilingualInput[]>([]);
        const primaryLanguageId = ref<number | null>(null);
        const failedFlags = ref(new Set<string>());
        const initialValueSet = ref(false);
        const richEditorRef = ref<typeof RichTextEditor[]>([]);

        const canRemove = computed(() => inputs.value.length > 1);

        const unusedLanguages = computed(() => {
            const usedIds = new Set(inputs.value.map(input => input.language.value));
            return supportedLanguages.value.filter(language => !usedIds.has(language.value));
        });

        const orderedInputs = computed(() => {
            const rows = [...inputs.value];
            rows.sort((a, b) => {
                if (a.language.value === primaryLanguageId.value) {
                    return -1;
                }
                if (b.language.value === primaryLanguageId.value) {
                    return 1;
                }
                return 0;
            });
            return rows;
        });

        const displayName = (language: LanguageChoice) =>
            getLanguageDisplayName(language, supportedLanguages.value);

        const flagUrl = (language: LanguageChoice) => getLanguageFlagUrl(language.title);

        const languageInitials = (language: LanguageChoice) =>
            language.title.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "?";

        const isPrimary = (input: MultilingualInput) =>
            primaryLanguageId.value === input.language.value;

        const languageButtonTitle = (input: MultilingualInput) => {
            if (!canRemove.value) {
                return t("languageLabel");
            }
            return isPrimary(input) ? t("primaryLanguageLabel") : t("setAsPrimaryLanguageLabel");
        };

        const languageAriaLabel = (input: MultilingualInput) => {
            const name = displayName(input.language);
            if (!canRemove.value) {
                return `${name}. ${t("languageLabel")}`;
            }
            return isPrimary(input)
                ? `${name} (${t("primaryLanguageLabel")})`
                : `${name}. ${t("setAsPrimaryLanguageLabel")}`;
        };

        const rowRules = (input: MultilingualInput) => {
            if (primaryLanguageId.value != null && input.language.value !== primaryLanguageId.value) {
                return [];
            }
            return props.rules;
        };

        const remainingLanguageChoices = () => {
            const usedIds = new Set(inputs.value.map(input => input.language.value));
            return supportedLanguages.value.filter(language => !usedIds.has(language.value));
        };

        const syncPrimaryFromInputs = () => {
            if (inputs.value.length === 0) {
                primaryLanguageId.value = null;
                return;
            }
            const highest = inputs.value.reduce((current, input) =>
                input.priority >= current.priority ? input : current
            );
            primaryLanguageId.value = highest.language.value;
        };

        onMounted(() => {
            setInitialState();
        });

        const setInitialState = () => {
            UserService.getLoggedInUser().then((response: AxiosResponse<UserResponse>) => {
                userPreferredLanguage.value.tag = response.data.preferredReferenceCataloguingLanguage;
                LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                    const languages = response.data;
                    supportedLanguages.value = [];
                    languages.forEach((language: LanguageTagResponse) => {
                        supportedLanguages.value.push({
                            title: language.languageCode,
                            value: language.id,
                            display: language.display
                        });
                        if (language.languageCode === userPreferredLanguage.value.tag) {
                            userPreferredLanguage.value.id = language.id;
                            if(inputs.value.length === 0) {
                                inputs.value.push(
                                    {
                                        language: {
                                            title: language.languageCode,
                                            value: language.id,
                                            display: language.display
                                        },
                                        text: props.defaultPlaceholder,
                                        supportedLanguages: [...supportedLanguages.value],
                                        priority: 1
                                    }
                                );
                                primaryLanguageId.value = language.id;
                            }
                        }
                    });

                    if (inputs.value.length > 0 && primaryLanguageId.value == null) {
                        syncPrimaryFromInputs();
                    }

                    if (props.defaultPlaceholder !== "") {
                        sendContentToParent();
                    }
                });
            });
        };

        const setInitialModelValue = () => {
            if(props.initialValue && props.initialValue.length > 0 && props.initialValue[0].text !== "") {
                inputs.value = [];

                const sortedInputs = [...props.initialValue]
                    .sort((a, b) => b.priority - a.priority);

                sortedInputs.forEach(input => {
                    input.supportedLanguages.push(input.language);
                    inputs.value.push({
                        language: input.language,
                        text: input.text,
                        priority: input.priority,
                        supportedLanguages: input.supportedLanguages });
                    filterFromInputChoices(input.language);
                });

                ensureAtLeastOneInput();
                syncPrimaryFromInputs();
                sendContentToParent();
            }
        };

        const setNewInputValue = (value: { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[], priority: number }[]) => {
            if(value && value.length > 0 && value[0].text !== "") {
                inputs.value = [];
                value.forEach(input => {
                    input.supportedLanguages.push(input.language);
                    inputs.value.push({
                        language: input.language,
                        text: input.text,
                        priority: input.priority,
                        supportedLanguages: input.supportedLanguages });
                    filterFromInputChoices(input.language);
                });

                ensureAtLeastOneInput();
                syncPrimaryFromInputs();
                sendContentToParent();
            }
        };

        const forceRefreshModelValue = (modelValue: { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[], priority: number }[]) => {
            inputs.value = [];
            modelValue.forEach(input => {
                input.supportedLanguages.push(input.language);
                inputs.value.push({
                    language: input.language,
                    text: input.text,
                    priority: input.priority,
                    supportedLanguages: input.supportedLanguages });
                filterFromInputChoices(input.language);
            });

            ensureAtLeastOneInput();
            syncPrimaryFromInputs();
            sendContentToParent();
        };

        watch(() => props.initialValue, () => {
            if(!initialValueSet.value && props.initialValue && props.initialValue.length > 0 && props.initialValue[0].supportedLanguages.length > 0) {
                setInitialModelValue();
                initialValueSet.value = true;
            }
        });

        const addLanguage = (language: LanguageChoice) => {
            if (inputs.value.some(input => input.language.value === language.value)) {
                return;
            }

            const remaining = remainingLanguageChoices().filter(item => item.value !== language.value);
            inputs.value.push({
                language: {
                    title: language.title,
                    value: language.value,
                    display: language.display
                },
                text: "",
                priority: 1,
                supportedLanguages: remaining
            });
            filterFromInputChoices({ title: language.title, value: language.value });
        };

        const removeLanguage = (input: MultilingualInput) => {
            if (inputs.value.length <= 1) {
                return;
            }
            const index = inputs.value.findIndex(item => item.language.value === input.language.value);
            if (index === -1) {
                return;
            }
            const removedLanguage = inputs.value[index].language;
            inputs.value.splice(index, 1);
            returnToInputChoices(removedLanguage);

            if (primaryLanguageId.value === removedLanguage.value) {
                syncPrimaryFromInputs();
            }

            sendContentToParent();
            ensureAtLeastOneInput();
        };

        const setPrimary = (input: MultilingualInput) => {
            if (primaryLanguageId.value === input.language.value) {
                return;
            }
            primaryLanguageId.value = input.language.value;
            sendContentToParent();
        };

        const onLanguageClick = (input: MultilingualInput) => {
            if (canRemove.value) {
                setPrimary(input);
            }
        };

        const changeLanguage = (input: MultilingualInput, language: LanguageChoice) => {
            if (input.language.value === language.value) {
                return;
            }

            const previous = {
                title: input.language.title,
                value: input.language.value,
                display: input.language.display
            };

            input.language = {
                title: language.title,
                value: language.value,
                display: language.display
            };

            returnToInputChoices(previous);
            filterFromInputChoices(input.language);

            if (primaryLanguageId.value === previous.value) {
                primaryLanguageId.value = language.value;
            }

            sendContentToParent();
        };

        const filterFromInputChoices = (selectedLanguage: {title: string, value: number}) => {
            inputs.value.forEach((input) => {
                if (input.language.title != selectedLanguage.title) {
                    input.supportedLanguages = input.supportedLanguages.filter(item => item.value !== selectedLanguage.value);
                }
            });
        };

        const returnToInputChoices = (selectedLanguage: {title: string, value: number}) => {
            inputs.value.forEach((input) => {
                if (!input.supportedLanguages.some(item => item.value === selectedLanguage.value)) {
                    input.supportedLanguages.push(selectedLanguage);
                }
            });
        };

        const clearInput = () => {
            inputs.value = [];
            supportedLanguages.value = [];
            primaryLanguageId.value = null;
            initialValueSet.value = false;
            setInitialState();
        };

        const sendContentToParent = () => {
            updatePriorities();

            const returnObject: MultilingualContent[] = [];
            inputs.value.forEach((input) => {
                if (!input.text || input.text === "<p></p>") {
                    input.text = "";
                    return;
                } else if (input.text.trim() === "") {
                    return;
                }

                returnObject.push({
                    content: input.text,
                    languageTag: input.language.title,
                    languageTagId: input.language.value,
                    priority: input.priority
                });
            });

            returnObject.sort((a, b) => a.priority - b.priority);

            emit("update:modelValue", returnObject);
            emit("update");

            ensureAtLeastOneInput();
        };

        const ensureAtLeastOneInput = () => {
            if (inputs.value.length === 0 && supportedLanguages.value.length > 0) {
                const preferred = supportedLanguages.value.find(language => language.value === userPreferredLanguage.value.id)
                    || supportedLanguages.value[0];
                inputs.value.push({
                    language: preferred,
                    text: "",
                    supportedLanguages: [...supportedLanguages.value],
                    priority: 1
                });
                primaryLanguageId.value = preferred.value;
            }
        };

        const updatePriorities = () => {
            if (primaryLanguageId.value != null && inputs.value.length > 0) {
                let nextPriority = inputs.value.length - 1;
                inputs.value.forEach((input) => {
                    if (input.language.value === primaryLanguageId.value) {
                        input.priority = inputs.value.length;
                    } else {
                        input.priority = Math.max(1, nextPriority--);
                    }
                });
                return;
            }

            inputs.value.forEach((input, index) => {
                input.priority = inputs.value.length - index;
            });
        };

        const onFlagError = (languageCode: string) => {
            const next = new Set(failedFlags.value);
            next.add(languageCode);
            failedFlags.value = next;
        };

        return {
            supportedLanguages,
            inputs,
            sendContentToParent,
            clearInput,
            forceRefreshModelValue,
            richEditorRef,
            setInitialModelValue,
            setNewInputValue,
            orderedInputs,
            unusedLanguages,
            canRemove,
            rowRules,
            displayName,
            flagUrl,
            languageInitials,
            isPrimary,
            languageAriaLabel,
            languageButtonTitle,
            onLanguageClick,
            addLanguage,
            changeLanguage,
            removeLanguage,
            setPrimary,
            failedFlags,
            onFlagError
        };
    }
});
</script>

<style scoped>
.multi-lingual-input {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 100%;
}

.multi-lingual-input__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 1.25rem;
}

.multi-lingual-input__label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.2;
    color: #64748b;
    padding-left: 0.15rem;
}

.multi-lingual-input__header .multi-lingual-input__add {
    padding: 0.1rem 0.45rem;
    margin-left: auto;
}

.multi-lingual-input__row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.35rem;
    width: 100%;
}

.multi-lingual-input__field {
    flex: 1;
    min-width: 0;
}

.multi-lingual-input__field:has(.multi-lingual-input__lang) {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
}

.multi-lingual-input__field > :last-child {
    flex: 1;
    min-width: 0;
}

.multi-lingual-input__field :deep(.v-field__prepend-inner) {
    padding-inline: 0.4rem 0.2rem;
    align-items: center;
}

.multi-lingual-input__lang {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0.15rem 0.2rem;
    min-height: 0;
    min-width: 0;
    color: #334155;
    border-radius: 0.4rem;
}

.multi-lingual-input__lang:hover,
.multi-lingual-input__lang:focus-visible {
    background: #f1f5f9;
    outline: none;
}

.multi-lingual-input__flag {
    width: 1.45rem;
    height: 1.45rem;
    border-radius: 9999px;
    overflow: visible;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
    font-size: 0.65rem;
    font-weight: 700;
    color: #475569;
    position: relative;
}

.multi-lingual-input__flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 9999px;
}

.multi-lingual-input__flag--menu {
    width: 1.5rem;
    height: 1.5rem;
}

.multi-lingual-input__menu {
    min-width: 14rem;
}

.multi-lingual-input__menu-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.multi-lingual-input__star {
    position: absolute;
    right: -3px;
    bottom: -3px;
    font-size: 0.72rem;
    line-height: 1;
    color: #cbd5e1;
    background: #fff;
    border-radius: 9999px;
    width: 0.9rem;
    height: 0.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.multi-lingual-input__lang.is-primary .multi-lingual-input__star {
    color: #f59e0b;
}

.multi-lingual-input__lang-code {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #64748b;
    max-width: 3.4rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.multi-lingual-input__lang-name {
    display: none;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
}

.multi-lingual-input__remove {
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 9999px;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
}

.multi-lingual-input__remove:hover,
.multi-lingual-input__remove:focus-visible {
    background: #fee2e2;
    color: #b91c1c;
    outline: none;
}

.multi-lingual-input__add {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    align-self: flex-start;
    min-height: 0.5rem;
    padding: 0.2rem 0.7rem;
    margin-left: 0;
    border: 0;
    border-radius: 0.4rem;
    background: transparent;
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer;
}

.multi-lingual-input__add:hover,
.multi-lingual-input__add:focus-visible {
    background: #f8fafc;
    color: #64748b;
    outline: none;
}

@media (min-width: 960px) {
    /* .multi-lingual-input__lang-code {
        display: none;
    } */

    .multi-lingual-input__lang-name {
        display: inline;
    }

    .multi-lingual-input__add {
        margin-left: 0.1rem;
    }
}
</style>
