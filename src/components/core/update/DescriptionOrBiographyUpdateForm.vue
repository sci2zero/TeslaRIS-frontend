<template>
    <v-form @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="descriptionRef" v-model="description" :initial-value="toMultilingualTextInput(presetDescriptionOrBiography, languageTags)" :label="$t('descriptionLabel')"
                            is-area></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import LanguageService from '@/services/LanguageService';
import type { PropType } from 'vue';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';

export default defineComponent({
    name: "DescriptionOrBiographyUpdateForm",
    components: {MultilingualTextInput},
    props: {
        presetDescriptionOrBiography: {
            type: Object as PropType<MultilingualContent[]>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const description = ref([]);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
        });

        const updateKeywords = () => {
            emit("update", description.value)
        };

        return {
            description, descriptionRef,
            updateKeywords, toMultilingualTextInput,
            languageTags
        };
    }
});
</script>
