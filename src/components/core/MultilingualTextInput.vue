<template>
    <v-row v-for="(input, index) in inputs" :key="index">
        <v-col cols="4">
            <v-text-field
                v-if="!isArea" v-model="input.text" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-text-field>
            <v-textarea
                v-if="isArea" v-model="input.text" :label="label" :placeholder="label"
                :rules="rules" @input="sendContentToParent"></v-textarea>
        </v-col>
        <v-col cols="2">
            <v-select
                v-model="input.language"
                :items="supportedLanguages"
                :label="$t('languageLabel')"
                return-object
                @update:model-value="sendContentToParent"
            ></v-select>
        </v-col>
        <v-col>
            <v-btn v-show="inputs.length > 1" icon @click="removeInput(index)">
                -
            </v-btn>
            <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                +
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import LanguageService from '@/services/LanguageService';
import { onMounted } from 'vue';
import type { LanguageResponse, MultilingualContent } from '@/models/Common';
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
        const inputs = ref<{ language: {title: string, value: number}, text: string }[]>([]);

        onMounted(() => {
            UserService.getLoggedInUser().then((response: AxiosResponse<UserResponse>) => {
                userPreferredLanguage.value.tag = response.data.preferredLanguage;
                LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                    const languages = response.data;
                    languages.forEach((language: LanguageResponse) => {
                        supportedLanguages.value.push({title: language.languageCode, value: language.id});
                        if (language.languageCode === userPreferredLanguage.value.tag) {
                            userPreferredLanguage.value.id = language.id;
                            inputs.value.push({ language: {title: language.languageCode, value: language.id}, text: "" });
                        }
                    });
                });
            });
        });

        const addInput = () => {
            inputs.value.push({ language: {title: userPreferredLanguage.value.tag, value: userPreferredLanguage.value.id}, text: "" });
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);
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
            sendContentToParent
        };
    }
});
</script>