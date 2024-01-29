<template>
    <v-row v-for="(input, index) in inputs" :key="index">
        <v-col cols="7">
            <v-text-field
                v-if="!isArea" v-model="input.text" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-text-field>
            <v-textarea
                v-if="isArea" v-model="input.text" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-textarea>
        </v-col>
        <v-col cols="3">
            <v-select
                v-model="input.language"
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


export default defineComponent({
    name: "MultilingualTextInput",
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
        rules: {
            type: Array as PropType<((value: string) => string | true)[]>,
            default: () => [],
        }
    },
    emits: ["setInput"],
    setup(_, {emit}) {
        const userPreferredLanguage = ref<{tag: string, id: number}>({tag: "", id: -1});
        const supportedLanguages = ref<{title: string, value: number}[]>([]);
        const inputs = ref<{ language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[]>([]);

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
                            inputs.value.push({ language: {title: language.languageCode, value: language.id}, text: "", supportedLanguages: supportedLanguages.value });
                        }
                    });
                });
            });
        };

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
        }

        const clearInput = () => {
            inputs.value = [];
            setInitialState();
        };

        const sendContentToParent = () => {
            const returnObject: MultilingualContent[] = [];
            inputs.value.forEach((input, index) => {
                returnObject.push({content: input.text, 
                                languageTag: input.language.title, 
                                languageTagId: input.language.value, 
                                priority: inputs.value.length - index});
            });
            emit("setInput", returnObject);
        };

        return {
            supportedLanguages,
            inputs,
            addInput,
            removeInput,
            sendContentToParent,
            clearInput,
            updatedLanguage
        };
    }
});
</script>