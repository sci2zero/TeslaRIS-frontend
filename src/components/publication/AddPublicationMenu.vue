<template>
    <v-menu open-on-hover>
        <template #activator="{ props }">
            <v-btn
                color="primary"
                :density="compact ? 'compact' : 'default'"
                v-bind="props">
                {{ $t("addNewEntityLabel") }}
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
    name: "AddPublicationMenu",
    props: {
        compact: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const router = useRouter();
        const { isInstitutionalLibrarian } = useUserRole();

        onMounted(() => {
            if (isInstitutionalLibrarian.value) {
                submissionMenuItems.value = submissionMenuItems.value.filter(item => item.value === "submitThesis");
            }
        });

        const navigateToPage = (name: string) => {
            router.push({name: name});
        };

        const i18n = useI18n();
        const addJournalPublicationLabel = computed(() => i18n.t("addJournalPublicationLabel"));
        const addProceedingsPublicationLabel = computed(() => i18n.t("addProceedingsPublicationLabel"));
        const addPatentLabel = computed(() => i18n.t("addPatentLabel"));
        const addSoftwareLabel = computed(() => i18n.t("addSoftwareLabel"));
        const addDatasetLabel = computed(() => i18n.t("addDatasetLabel"));
        const createNewMonographLabel = computed(() => i18n.t("createNewMonographLabel"));
        const addMonographPublicationLabel = computed(() => i18n.t("addMonographPublicationLabel"));
        const addThesisLabel = computed(() => i18n.t("addThesisLabel"));

        const submissionMenuItems = ref([
            { title: addJournalPublicationLabel, value: "submitJournalPublication" },
            { title: addProceedingsPublicationLabel, value: "submitProceedingsPublication" },
            { title: createNewMonographLabel, value: "submitMonograph" },
            { title: addMonographPublicationLabel, value: "submitMonographPublication" },
            { title: addThesisLabel, value: "submitThesis" },
            { title: addPatentLabel, value: "submitPatent" },
            { title: addSoftwareLabel, value: "submitSoftware" },
            { title: addDatasetLabel, value: "submitDataset" },
        ]);

        return {
            submissionMenuItems, navigateToPage
        };
    }
});
</script>
