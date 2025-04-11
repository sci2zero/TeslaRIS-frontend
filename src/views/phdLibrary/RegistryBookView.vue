<template>
    <v-container>
        <h1>{{ $t("registryBookLabel") }}</h1>
        <br />
        <br />
        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="nonPromoted">
                {{ $t("nonPromotedLabel") }}
            </v-tab>
            <v-tab value="forPromotion">
                {{ $t("inPromotionLabel") }}
            </v-tab>
        </v-tabs>
  
        <v-tabs-window v-model="currentTab">
            <v-window-item value="nonPromoted">
                <registry-book-entry-table
                    ref="tableRef"
                    :entries="tableStates.nonPromoted.entries"
                    :total-entries="tableStates.nonPromoted.totalEntries"
                    @switch-non-promoted-page="(args: any[]) => switchPage('nonPromoted', ...(args as [number, number, string, string]))"
                    @entry-added-to-promotion="fetchAllTables"
                />
            </v-window-item>
            <v-window-item value="forPromotion">
                <v-select
                    v-model="selectedPromotion"
                    class="promotion-select"
                    :items="promotions"
                    :label="$t('promotionLabel')"
                    return-object
                />
                <registry-book-entry-table
                    ref="tableRef"
                    class="mt-5"
                    :entries="tableStates.forPromotion.entries"
                    :total-entries="tableStates.forPromotion.totalEntries"
                    @switch-non-promoted-page="(args: any[]) => switchPage('forPromotion', ...(args as [number, number, string, string]))"
                    @entry-not-promoted="fetchAllTables"
                />

                <div class="d-flex flex-row justify-between mb-5">
                    <promotion-printed-lists
                        v-if="tableStates.forPromotion.totalEntries > 0"
                        :promotion-id="selectedPromotion.value"
                    />
                    <v-btn
                        class="ml-3"
                        color="primary"
                        @click="promoteAll">
                        {{ $t("promoteAllLabel") }}
                    </v-btn>
                </div>
            </v-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>
  
<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import RegistryBookEntryTable from '@/components/thesisLibrary/RegistryBookEntryTable.vue';
import PromotionPrintedLists from '@/components/thesisLibrary/PromotionPrintedLists.vue';
import type { RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { localiseDate } from '@/i18n/dateLocalisation';
import Toast from '@/components/core/Toast.vue';
  

type TabKey = 'nonPromoted' | 'forPromotion';

interface EntryTableState {
    entries: RegistryBookEntry[];
    totalEntries: number;
    page: number;
    size: number;
    sort: string;
    direction: string;
    fetchFn: () => Promise<void>;
}
  
export default defineComponent({
    name: "RegistryBookListView",
    components: { RegistryBookEntryTable, PromotionPrintedLists, Toast },
    setup() {
        const message = ref("");
        const snackbar = ref(false);

        const currentTab = ref<TabKey>("nonPromoted");
        const tableRef = ref<typeof RegistryBookEntryTable>();
    
        const i18n = useI18n();
    
        const promotions = ref<{ title: string; value: number }[]>([]);
        const selectedPromotion = ref<{ title: string; value: number }>({
            title: "",
            value: -1
        });
    
        const tableStates = reactive<Record<TabKey, EntryTableState>>({
            nonPromoted: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 1,
                sort: "",
                direction: "",
                fetchFn: async () => {
                    const query = `nonPromotedPage=${tableStates.nonPromoted.page}&nonPromotedSize=${tableStates.nonPromoted.size}&nonPromotedSort=${tableStates.nonPromoted.sort},${tableStates.nonPromoted.direction}`;
                    const response = await RegistryBookService.getNonPromotedEntries(query);
                    tableStates.nonPromoted.entries = response.data.content;
                    tableStates.nonPromoted.totalEntries = response.data.totalElements;
                }
            },
            forPromotion: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 1,
                sort: "",
                direction: "",
                fetchFn: async () => {
                    const query = `nonPromotedPage=${tableStates.forPromotion.page}&nonPromotedSize=${tableStates.forPromotion.size}&nonPromotedSort=${tableStates.forPromotion.sort},${tableStates.forPromotion.direction}`;
                    const response = await RegistryBookService.getForPromotion(
                        selectedPromotion.value.value,
                        query
                    );
                    tableStates.forPromotion.entries = response.data.content;
                    tableStates.forPromotion.totalEntries = response.data.totalElements;
                }
            }
        });
    
        const fetchAllTables = () => {
            Object.values(tableStates).forEach(state => state.fetchFn());
        };
    
        const switchPage = (
            tab: TabKey,
            nextPage: number,
            pageSize: number,
            sortField: string,
            sortDir: string
        ) => {
            const state = tableStates[tab];
            state.page = nextPage;
            state.size = pageSize;
            state.sort = sortField;
            state.direction = sortDir;
            state.fetchFn();
        };
    
        const fetchPromotions = () => {
            PromotionService.getNonFinishedPromotions("").then(response => {
            promotions.value.splice(0);
            response.data.content.forEach(promotion => {
                promotions.value.push({
                title: localiseDate(promotion.promotionDate) as string,
                value: promotion.id as number
                });
            });
    
            if (promotions.value.length > 0) {
                selectedPromotion.value = promotions.value[0];
            }
    
            fetchAllTables();
            });
        };
    
        watch(i18n.locale, () => {
            fetchAllTables();
        });
    
        onMounted(() => {
            document.title = i18n.t("registryBookLabel");
            fetchPromotions();
        });

        const promoteAll = () => {
            RegistryBookService.promoteAll(selectedPromotion.value.value)
            .then(() => {
                tableStates.forPromotion.fetchFn();
                fetchPromotions();
                message.value = i18n.t("promotedSuccessfullyMessage");
                snackbar.value = true;
            });
        };
    
        return {
            currentTab, tableRef,
            tableStates, switchPage,
            promotions, selectedPromotion,
            fetchAllTables, promoteAll,
            snackbar, message
        };
    }
});
</script>

<style scoped>

.promotion-select {
    max-width: 200px;
    margin-top: 10px;
}

</style>
