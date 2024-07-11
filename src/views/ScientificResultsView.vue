<template>
    <v-container>
        <h1>{{ $t("scientificResultsListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="search"></search-bar-component>
        <br />
        <v-menu
            v-if="userRole"
            open-on-hover
        >
            <template #activator="{ props }">
                <v-btn
                    color="primary"
                    v-bind="props"
                >
                    {{ $t("addNewEntityLabel") }}
                </v-btn>
            </template>

            <v-list>
                <v-list-item
                    v-for="(item, index) in items"
                    :key="index"
                    @click="navigateToPage(item.value)"
                >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <br />
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { ref } from 'vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import { useRouter } from 'vue-router';
import UserService from '@/services/UserService';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { onMounted } from 'vue';

export default defineComponent({
    name: "ScientificResultsListView",
    components: {SearchBarComponent, PublicationTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();
        const userRole = UserService.provideUserRole();

        onMounted(() => {
            document.title = i18n.t("scientificResultsListLabel");
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            DocumentPublicationService.searchDocumentPublications(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const navigateToPage = (name: string) => {
            router.push({name: name});
        }

        const i18n = useI18n();
        const addJournalPublicationLabel = computed(() => i18n.t("addJournalPublicationLabel"));
        const addProceedingsPublicationLabel = computed(() => i18n.t("addProceedingsPublicationLabel"));
        const addProceedingsLabel = computed(() => i18n.t("addProceedingsLabel"));
        const addPatentLabel = computed(() => i18n.t("addPatentLabel"));
        const addSoftwareLabel = computed(() => i18n.t("addSoftwareLabel"));
        const addDatasetLabel = computed(() => i18n.t("addDatasetLabel"));
        const addMonographLabel = computed(() => i18n.t("addMonographLabel"));

        const items = ref([
            { title: addJournalPublicationLabel, value: "submitJournalPublication" },
            { title: addProceedingsPublicationLabel, value: "submitProceedingsPublication" },
            { title: addProceedingsLabel, value: "submitProceedings" },
            { title: addPatentLabel, value: "submitPatent" },
            { title: addSoftwareLabel, value: "submitSoftware" },
            { title: addDatasetLabel, value: "submitDataset" },
            { title: addMonographLabel, value: "submitMonograph" },
        ]);

        return {search, publications, totalPublications, switchPage, userRole, items, navigateToPage};
    }
});
</script>
