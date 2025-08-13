<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-container v-for="(input, index) in inputs" :key="index" class="bottom-spacer contributions-box">
            <v-row>
                <v-col cols="10">
                    <multilingual-text-input
                        v-model="input.content"
                        :rules="requiredFieldRules"
                        :label="$t('contentLabel') + '*'"
                        :initial-value="toMultilingualTextInput(input?.presetContent, languageTags)"
                        is-area
                    />
                </v-col>
                <v-col cols="2">
                    <v-col>
                        <v-btn
                            v-show="inputs.length > ((presetPageContent && presetPageContent.length > 0) ? 0 : 1)"
                            icon
                            @click="removeInput(index)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-col>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-select
                        v-model="input.contentType"
                        :items="pageContentTypes"
                        :label="$t('contentTypeLabel') + '*'"
                        :rules="requiredSelectionRules"
                        return-object>
                    </v-select>
                </v-col>
                <v-col cols="6">
                    <v-select
                        v-model="input.pageType"
                        :items="pageTypes"
                        :label="$t('pageTypeLabel') + '*'"
                        :rules="requiredSelectionRules"
                        return-object>
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-select
                        v-model="input.thesisTypes"
                        :items="thesisTypes"
                        :label="$t('applicableTypeLabel') + '*'"
                        :rules="requiredSelectionRules"
                        return-object
                        multiple>
                    </v-select>
                </v-col>
            </v-row>
        </v-container>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { PageContentType, PageType, type PublicReviewPageContent } from '@/models/ThesisLibraryModel';
import { getPageContentTypeFromValueAutoLocale, getPageContentTypesForGivenLocale } from '@/i18n/pageContentType';
import { getPageTypeFromValueAutoLocale, getPageTypesForGivenLocale } from '@/i18n/pageType';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import PublicReviewPageConfigurationService from '@/services/thesisLibrary/PublicReviewPageConfigurationService';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';


interface PageContentInput{
    contentType: {title: string, value: PageContentType};
    pageType: {title: string, value: PageType};
    thesisTypes: {title: string, value: ThesisType}[];
    content: any[];
    presetContent: any[];
}


export default defineComponent({
    name: "PublicReviewContentForm",
    components: { MultilingualTextInput },
    props: {
        presetPageContent: {
            type: Array<PublicReviewPageContent>,
            default: []
        },
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const inputs = ref<PageContentInput[]>([]);

        const pageContentTypes = computed(() => getPageContentTypesForGivenLocale());
        const pageTypes = computed(() => getPageTypesForGivenLocale());
        const thesisTypes = computed(() => getThesisTypesForGivenLocale());

        const { languageTags } = useLanguageTags();

        const content = ref<any>([]);

        const {
            requiredSelectionRules,
            requiredFieldRules
        } = useValidationUtils();

        onMounted(() => {
            inputs.value?.splice(0);
            props.presetPageContent?.forEach(pageContent => {
                inputs.value?.push(
                    {
                        contentType: {
                            title: getPageContentTypeFromValueAutoLocale(pageContent.contentType) as string,
                            value: pageContent.contentType
                        },
                        pageType: {
                            title: getPageTypeFromValueAutoLocale(pageContent.pageType) as string,
                            value: pageContent.pageType
                        },
                        thesisTypes:
                            pageContent.thesisTypes.map(thesisType => {
                                return {title: getThesisTitleFromValueAutoLocale(thesisType) as string, value: thesisType};
                            }
                        ),
                        presetContent: pageContent.content,
                        content: []
                    }
                );
            });
        });

        const addInput = () => {
            inputs.value.push({
                contentType: {
                    title: getPageContentTypeFromValueAutoLocale(PageContentType.TEXT) as string,
                    value: PageContentType.TEXT
                },
                pageType: {
                    title: getPageTypeFromValueAutoLocale(PageType.ALL) as string,
                    value: PageType.ALL
                },
                thesisTypes: [
                    {title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, value: ThesisType.PHD},
                    {title: getThesisTitleFromValueAutoLocale(ThesisType.PHD_ART_PROJECT) as string, value: ThesisType.PHD_ART_PROJECT}
                ],
                content: [],
                presetContent: []
            });
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);
            inputs.value = [...inputs.value];
        };

        const submit = () => {
            const newContent: PublicReviewPageContent[] = [];

            inputs.value.forEach(input => {
                newContent.push({
                    content: input.content,
                    contentType: input.contentType.value,
                    pageType: input.pageType.value,
                    thesisTypes: input.thesisTypes.map(thesisType => thesisType.value)
                });
            });

            PublicReviewPageConfigurationService.saveConfiguration(
                newContent, props.institutionId
            ).then(() => {
                emit("update", {});
            });
        };

        return {
            isFormValid, pageContentTypes,
            inputs, languageTags,
            requiredSelectionRules,
            submit, pageTypes, content,
            toMultilingualTextInput,
            requiredFieldRules, thesisTypes,
            addInput, removeInput
        };
    }
});
</script>
