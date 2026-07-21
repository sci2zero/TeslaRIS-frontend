<template>
    <v-menu open-on-hover open-on-click :open-delay="100">
        <template #activator="{ props }">
            <v-btn
                color="primary"
                :density="compact ? 'compact' : 'default'"
                v-bind="props">
                {{ $t("addNewEventLabel") }}
            </v-btn>
        </template>

        <v-list>
            <v-list-item
                v-for="(item, index) in submissionMenuItems"
                :key="index"
                @click="navigateToPage(item.value)"
            >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { useUserRole } from '@/composables/useUserRole';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "AddEventMenu",
    props: {
        compact: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const router = useRouter();
        const { isInstitutionalLibrarian, isHeadOfLibrary } = useUserRole();

        onMounted(() => {
            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
                submissionMenuItems.value =
                    submissionMenuItems.value.filter(item => item.value === "submitThesis");
            }
        });

        const navigateToPage = (name: string) => {
            router.push({name: name});
        };

        const i18n = useI18n();
        const addConferenceEventLabel = computed(() => i18n.t("createConferenceLabel"));
        const addExhibitionEventLabel = computed(() => i18n.t("createExhibitionLabel"));
        const addCourseEventLabel = computed(() => i18n.t("createCourseLabel"));
        const addOtherEventLabel = computed(() => i18n.t("createOtherEventLabel"));

        const submissionMenuItems = ref([
            { title: addConferenceEventLabel, value: "submitConference" },
            { title: addExhibitionEventLabel, value: "submitExhibition" },
            { title: addCourseEventLabel, value: "submitCourse" },
            { title: addOtherEventLabel, value: "submitOtherEvent" }
        ]);

        return {
            submissionMenuItems,
            navigateToPage
        };
    }
});
</script>
