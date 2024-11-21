<template>
    <v-row v-for="(input, index) in inputs" :key="index" class="multi-lingual-input">
        <v-col cols="7">
            <v-text-field
                v-if="!isArea && !isRich"
                v-model="input.text" hide-details="auto" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-text-field>
            <v-textarea
                v-if="isArea && !isRich"
                v-model="input.text" hide-details="auto" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-textarea>
            <rich-text-editor v-if="isRich" v-model="input.text" @input="sendContentToParent"></rich-text-editor>
        </v-col>
        <v-col cols="3">
            <v-select
                v-model="input.language"
                hide-details="auto"
                :items="input.supportedLanguages"
                :label="$t('languageLabel')"
                return-object
                @update:model-value="updatedLanguage(index)"
            ></v-select>
        </v-col>
        <v-col cols="2">
            <v-btn v-show="inputs.length > 1" icon @click="removeInput(index)">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn v-show="index === inputs.length - 1 && input.supportedLanguages.length > 1" icon @click="addInput">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import LanguageService from '@/services/LanguageService';
import { onMounted } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import type { AxiosResponse } from 'axios';
import UserService from '@/services/UserService';
import type { UserResponse } from '@/models/UserModel';
import { watch } from 'vue';
import RichTextEditor from './RichTextEditor.vue';


export default defineComponent({
    name: "MultilingualTextInput",
    components: { RichTextEditor },
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
            type: Object as PropType<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[] | undefined>,
            required: true,
        },
        initialValue: {
            type: Object as PropType<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[] | undefined>,
            required: false,
            default: undefined
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const userPreferredLanguage = ref<{tag: string, id: number}>({tag: "", id: -1});
        const supportedLanguages = ref<{title: string, value: number}[]>([]);
        const inputs = ref<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[]>([]);

        const initialValueSet = ref(false);

        onMounted(() => {
            setInitialState();
        });

        const setInitialState = () => {
            UserService.getLoggedInUser().then((response: AxiosResponse<UserResponse>) => {
                userPreferredLanguage.value.tag = response.data.preferredLanguage;
                LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                    const languages = response.data;
                    languages.forEach((language: LanguageTagResponse) => {
                        supportedLanguages.value.push({title: language.languageCode, value: language.id});
                        if (language.languageCode === userPreferredLanguage.value.tag) {
                            userPreferredLanguage.value.id = language.id;
                            if(inputs.value.length === 0) {
                                inputs.value.push({ language: {title: language.languageCode, value: language.id}, text: "", supportedLanguages: supportedLanguages.value });
                            }
                        }
                    });
                });
            });
        };

        const setInitialModelValue = () => {
            if(props.initialValue && props.initialValue.length > 0 && props.initialValue[0].text !== "") {
                inputs.value = [];
                props.initialValue.forEach(input => {
                    input.supportedLanguages.push(input.language);
                    inputs.value.push({ language: input.language, text: input.text, supportedLanguages: input.supportedLanguages });
                    filterFromInputChoices(input.language);
                });
                sendContentToParent();
            }
        };

        const forceRefreshModelValue = (modelValue: { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[]) => {
            inputs.value = [];
            modelValue.forEach(input => {
                input.supportedLanguages.push(input.language);
                inputs.value.push({ language: input.language, text: input.text, supportedLanguages: input.supportedLanguages });
                filterFromInputChoices(input.language);
            });
            sendContentToParent();
        }

        watch(() => props.initialValue, () => {
            if(!initialValueSet.value && props.initialValue && props.initialValue.length > 0 && props.initialValue[0].supportedLanguages.length > 0) {
                setInitialModelValue();
                initialValueSet.value = true;
            }
        });

        const addInput = () => {
            let languageChoice = supportedLanguages.value;
            inputs.value.forEach((input) => {
                languageChoice = languageChoice.filter(item => item.value !== input.language.value);
            });
            
            inputs.value.push({ language: {title: languageChoice[0].title, value: languageChoice[0].value}, text: "", supportedLanguages: languageChoice });
            
            filterFromInputChoices(languageChoice[0]);
        };

        const removeInput = (index: number) => {
            const removedLanguage = inputs.value[index].language;
            inputs.value.splice(index, 1);
            returnToInputChoices(removedLanguage);

            sendContentToParent();
        };

        const updatedLanguage = (index: number) => {
            const selectedLanguage = inputs.value[index].language;
            const inputAffected = inputs.value[index];
            filterFromInputChoices(selectedLanguage);

            inputAffected.supportedLanguages.forEach((language) => {
                if (language.title != selectedLanguage.title) {
                    returnToInputChoices(language);
                }
            })

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
            setInitialState();
        };

        const sendContentToParent = () => {
            const returnObject: MultilingualContent[] = [];
            inputs.value.forEach((input, index) => {
                if (!input.text || input.text === "<p></p>") {
                    input.text = "";
                    return;
                } else if(input.text.trim() === "") {
                    return;
                }
                returnObject.push({content: input.text, 
                                languageTag: input.language.title, 
                                languageTagId: input.language.value, 
                                priority: inputs.value.length - index});
            });
            emit("update:modelValue", returnObject);
        };

        return {
            supportedLanguages,
            inputs,
            addInput,
            removeInput,
            sendContentToParent,
            clearInput,
            updatedLanguage,
            forceRefreshModelValue
        };
    }
});
</script>

<style scoped>
    .multi-lingual-input:first-child:not(:last-child) > div.v-col{
        padding-bottom: 0;
    }
    .multi-lingual-input:last-child:not(:first-child) > div.v-col{
        padding-top: 0;
    }
    .multi-lingual-input:not(:first-child):not(:last-child)  > div.v-col{
        padding-bottom: 0;
        padding-top: 0;
    }

</style>