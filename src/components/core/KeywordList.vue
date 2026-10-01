<template>
    <landing-section-card
        :title="$t('keywordsLabel')"
        :count="parsedKeywords.length"
        icon="mdi-tag-multiple-outline"
        icon-class="bg-amber-50 text-amber-700"
        padded
    >
        <template v-if="canEdit" #action>
            <generic-crud-modal
                :form-component="KeywordUpdateForm"
                :form-props="{ presetKeywords: keywords ? keywords : [] }"
                entity-name="Keywords"
                is-update
                is-section-update
                @update="emitToParent"
            >
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        variant="outlined"
                        size="small"
                        class="text-none"
                        prepend-icon="mdi-pencil-outline">
                        {{ $t("editActionLabel") }}
                    </v-btn>
                </template>
            </generic-crud-modal>
        </template>

        <p
            v-if="parsedKeywords.length === 0"
            class="text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <div v-else class="flex flex-wrap gap-2">
            <v-chip
                v-for="(keyword, index) in parsedKeywords"
                :key="index"
                size="small"
                variant="tonal"
                color="amber"
                @click="searchKeyword(keyword)">
                {{ keyword }}
            </v-chip>
        </div>
    </landing-section-card>
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
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';


export default defineComponent({
    name: "KeywordList",
    components: { GenericCrudModal, LandingSectionCard },
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
                parsedKeywords.value = [];
                return;
            }

            parsedKeywords.value = (returnCurrentLocaleContent(props.keywords)?.split("\n") || [])
                .map((keyword) => keyword.trim())
                .filter(Boolean);
        };

        watch(i18n.locale, () => {
            displayKeywords();
        });

        return { 
            searchKeyword, parsedKeywords, 
            KeywordUpdateForm, emitToParent 
        };
    },
});
</script>
