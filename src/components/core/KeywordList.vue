<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <keyword-update-modal :preset-keywords="keywords ? keywords : []" :read-only="!canEdit" @update="emitToParent"></keyword-update-modal>

                    <div><b>{{ $t("keywordsLabel") }}</b></div>
                    <strong v-if="!parsedKeywords || parsedKeywords.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-chip v-for="(keyword, index) in parsedKeywords" :key="index" outlined @click="searchKeyword(keyword)">
                        {{ keyword }}
                    </v-chip>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import KeywordUpdateModal from './update/KeywordUpdateModal.vue';
import type { MultilingualContent } from '@/models/Common';
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import { ref } from 'vue';


export default defineComponent({
    name: "KeywordList",
    components: { KeywordUpdateModal },
    props: {
        canEdit: {
            type: Boolean,
            default: false
        },
        keywords: {
            type: Object as PropType<MultilingualContent[]>,
            required: true
        },
    },
    emits: ["searchKeyword", "update"],
    setup(props, { emit }) {
        const parsedKeywords = ref<string[]>([]); 
        
        const searchKeyword = (keyword: string) => {
            emit("searchKeyword", keyword)
        };

        const emitToParent = (keywords: MultilingualContent[]) => {
            emit("update", keywords);
        }

        watch(() => props.keywords, () => {
            parsedKeywords.value = returnCurrentLocaleContent(props.keywords)?.split(",") as string[];
        });

        return { searchKeyword, parsedKeywords, emitToParent };
    },
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }

</style>
