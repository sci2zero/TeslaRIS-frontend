<template>
    <v-form @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="keywordsRef" v-model="keywords" :initial-value="toMultilingualTextInput(presetKeywords, languageTags)" :label="$t('keywordsLabel')"
                            is-area></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import LanguageService from '@/services/LanguageService';
import type { PropType } from 'vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';

export default defineComponent({
    name: "KeywordUpdateForm",
    components: {MultilingualTextInput},
    props: {
        presetKeywords: {
            type: Object as PropType<MultilingualContent[]>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const keywords = ref<any>([]);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
        });

        const updateKeywords = () => {
            emit("update", keywords.value)
        };

        watch(() => props.presetKeywords, () => {
            if (props.presetKeywords) {
                refreshForm();
            }
        });

        const refreshForm = () => {
            keywordsRef.value?.clearInput();
            keywords.value = props.presetKeywords as MultilingualContent[];
            keywordsRef.value?.forceRefreshModelValue(toMultilingualTextInput(keywords.value, languageTags.value));
        };

        return {
            keywords, keywordsRef,
            updateKeywords, toMultilingualTextInput,
            languageTags, refreshForm
        };
    }
});
</script>
