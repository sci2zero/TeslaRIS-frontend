<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <generic-crud-modal
                        :form-component="KeywordUpdateForm"
                        :form-props="{ presetKeywords: keywords ? keywords : [] }"
                        entity-name="Keywords"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        @update="emitToParent"
                    />

                    <div class="mb-2">
                        <b>{{ $t("keywordsLabel") }}</b>
                    </div>
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
import { defineComponent, onMounted, type PropType } from 'vue';
import GenericCrudModal from './GenericCrudModal.vue';
import type { MultilingualContent } from '@/models/Common';
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import KeywordUpdateForm from './update/KeywordUpdateForm.vue';


export default defineComponent({
    name: "KeywordList",
    components: { GenericCrudModal },
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

        const i18n = useI18n();

        onMounted(() => {
            displayKeywords();
        });
        
        const searchKeyword = (keyword: string) => {
            emit("searchKeyword", keyword)
        };

        const emitToParent = (keywords: MultilingualContent[]) => {
            emit("update", keywords);
        }

        watch(() => props.keywords, () => {
            displayKeywords();
        });

        const displayKeywords = () => {
            if (!props.keywords) {
                return;
            }

            parsedKeywords.value = returnCurrentLocaleContent(props.keywords)?.split("\n") as string[];
        };

        watch(i18n.locale, () => {
            parsedKeywords.value = returnCurrentLocaleContent(props.keywords)?.split("\n") as string[];
        });

        return { 
            searchKeyword, parsedKeywords, 
            KeywordUpdateForm, emitToParent 
        };
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
