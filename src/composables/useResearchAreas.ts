import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AssessmentResearchAreaService from "@/services/assessment/AssessmentResearchAreaService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export function useResearchAreas() {
    const { locale } = useI18n();
    const researchAreas = ref<{ title: string; value: string }[]>([]);

    const fetchResearchAreas = async () => {
        try {
            const response = await AssessmentResearchAreaService.readAssessmentResearchAreas();
            researchAreas.value = response.data.map(researchArea => ({
                title: returnCurrentLocaleContent(researchArea.name) as string,
                value: researchArea.code
            }));
        } catch (error) {
            console.error("Error fetching research areas:", error);
        }
    };

    onMounted(fetchResearchAreas);

    watch(locale, fetchResearchAreas);

    return {
        researchAreas
    };
}
