import { ref, onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { LanguageTagResponse } from '@/models/Common';


export function useLanguageTags() {
    const languageTags = ref<LanguageTagResponse[]>([]);

    const fetchLanguageTags = async () => {
        try {
            const response = await LanguageService.getAllLanguageTags();
            languageTags.value = response.data;
        } catch (error) {
            console.error("Failed to fetch language tags:", error);
        }
    };

    onMounted(fetchLanguageTags);

    return { languageTags, fetchLanguageTags };
}
