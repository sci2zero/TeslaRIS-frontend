<template>
    <v-content>
        <div v-for="type in contentTypes" :key="type" class="mt-2">
            <div
                v-for="(content, index) in allContent.filter(c => (c.pageType === pageType || c.pageType === PageType.ALL) && c.contentType === type)"
                :key="index"
                class="d-flex flex-row justify-start mb-2"
            >
                <p
                    v-if="getLabelKey(type)"
                    :class="'mr-1 ' + (type === PageContentType.IMPORTANT_NOTE ? 'text-red' : '')">
                    {{ $t(getLabelKey(type) as string) }}:
                </p>
                <p>{{ returnCurrentLocaleContent(content.content) }}</p>
            </div>
        </div>
    </v-content>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { ThesisType } from '@/models/PublicationModel';
import { PageContentType, PageType, type PublicReviewPageContent } from '@/models/ThesisLibraryModel';
import PublicReviewPageConfigurationService from '@/services/thesisLibrary/PublicReviewPageConfigurationService';
import { defineComponent, onMounted, type PropType, ref } from 'vue';


export default defineComponent({
    name: "PublicReviewPageContentDisplay",
    props: {
        institutionId: {
            type: Number,
            required: true
        },
        thesisTypes: {
            type: Array<ThesisType>,
            required: true
        },
        contentTypes: {
            type: Array<PageContentType>,
            required: true
        },
        pageType: {
            type: Object as PropType<PageType>,
            required: true
        }
    },
    setup(props) {
        const allContent = ref<PublicReviewPageContent[]>([]);

        onMounted(() => {
            allContent.value.splice(0);
            PublicReviewPageConfigurationService.getConfigurationForInstitutionAndThesisTypes(
                props.institutionId, props.thesisTypes
            ).then(response => {
                allContent.value = response.data;
            })
        });

        const getLabelKey = (type: PageContentType) => {
            switch (type) {
                case PageContentType.IMPORTANT_NOTE:
                    return "importantNoteLabel";
                case PageContentType.NOTE:
                    return "noteLabel";
                default:
                    return null;
            }
        };

        return {
            allContent, PageContentType,
            returnCurrentLocaleContent,
            getLabelKey, PageType
        };
}})

</script>
