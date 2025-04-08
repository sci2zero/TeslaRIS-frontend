import { ref, onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';


export function useLanguageTags() {
    const languageTags = ref<LanguageTagResponse[]>([]);
    const languageTagsList = ref<{title: string, value: number}[]>([]);

    const fetchLanguageTags = async () => {
        try {
            const response = await LanguageService.getAllLanguageTags();
            languageTags.value = response.data;
            
            languageTagsList.value.splice(0);
            response.data.forEach(languageTag => {
                languageTagsList.value.push({title: languageTag.display, value: languageTag.id});
            });
        } catch (error) {
            console.error("Failed to fetch language tags:", error);
        }
    };

    onMounted(fetchLanguageTags);

    return { languageTags, fetchLanguageTags, languageTagsList };
}
