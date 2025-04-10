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
                    :entries="nonPromotedEntries"
                    :total-entries="totalNonPromotedEntries"
                    @switch-non-promoted-page="switchNonPromotedPage"
                    @entry-added-to-promotion="fetchRegistryBookEntrys(true)">
                </registry-book-entry-table>
            </v-window-item>
            <v-window-item value="forPromotion">
                <v-select
                    v-model="selectedPromotion"
                    :items="promotions"
                    :label="$t('promotionLabel')"
                    return-object>
                </v-select>
                <registry-book-entry-table
                    ref="tableRef"
                    class="mt-5"
                    :entries="inPromotionEntries"
                    :total-entries="totalInPromotionEntries"
                    @switch-non-promoted-page="switchInPromotionPage"
                    @entry-not-promoted="fetchRegistryBookEntrys(false)">
                </registry-book-entry-table>
            </v-window-item>
        </v-tabs-window>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import RegistryBookEntryTable from '@/components/thesisLibrary/RegistryBookEntryTable.vue';
import { ref } from 'vue';
import type { RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import { localiseDate } from '@/i18n/dateLocalisation';


export default defineComponent({
    name: "RegistryBookListView",
    components: { RegistryBookEntryTable },
    setup() {
        const currentTab = ref("nonPromoted");

        const nonPromotedEntries = ref<RegistryBookEntry[]>([]);
        const totalNonPromotedEntries = ref(0);
        const nonPromotedPage = ref(0);
        const nonPromotedSize = ref(1);
        const nonPromotedSort = ref("");
        const nonPromotedDirection = ref("");

        const inPromotionEntries = ref<RegistryBookEntry[]>([]);
        const totalInPromotionEntries = ref(0);
        const inPromotionPage = ref(0);
        const inPromotionSize = ref(1);
        const inPromotionSort = ref("");
        const inPromotionDirection = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof RegistryBookEntryTable>();

        const promotions = ref<{title: string, value: number}[]>([]);
        const selectedPromotion = ref<{title: string, value: number}>({title: "", value: -1});

        onMounted(() => {
            document.title = i18n.t("registryBookEntryListLabel");
            fetchPromotions();
        });

        const fetchPromotions = () => {
            PromotionService.getNonFinishedPromotions("")
            .then(response => {
                promotions.value.splice(0);
                response.data.content.forEach(promotion => {
                    promotions.value.push(
                        {
                            title: localiseDate(promotion.promotionDate) as string,
                            value: promotion.id as number
                        }
                    );
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

        const fetchAllTables = () => {
            fetchRegistryBookEntrys(true);
            fetchRegistryBookEntrys(false);
        }

        const fetchRegistryBookEntrys = (nonPromoted: boolean) => {
            if (nonPromoted) {
                RegistryBookService.getNonPromotedEntries(
                    `nonPromotedPage=${nonPromotedPage.value}&nonPromotedSize=${nonPromotedSize.value}&nonPromotedSort=${nonPromotedSort.value},${nonPromotedDirection.value}`
                ).then((response) => {
                    nonPromotedEntries.value = response.data.content;
                    totalNonPromotedEntries.value = response.data.totalElements;
                });
            } else {
                RegistryBookService.getForPromotion(
                    selectedPromotion.value.value,
                    `nonPromotedPage=${nonPromotedPage.value}&nonPromotedSize=${nonPromotedSize.value}&nonPromotedSort=${nonPromotedSort.value},${nonPromotedDirection.value}`
                ).then((response) => {
                    inPromotionEntries.value = response.data.content;
                    totalInPromotionEntries.value = response.data.totalElements;
                });
            }
        };

        const switchNonPromotedPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            nonPromotedPage.value = nextPage;
            nonPromotedSize.value = pageSize;
            nonPromotedSort.value = sortField;
            nonPromotedDirection.value = sortDir;
            fetchRegistryBookEntrys(true);
        };

        const switchInPromotionPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            inPromotionPage.value = nextPage;
            inPromotionSize.value = pageSize;
            inPromotionSort.value = sortField;
            inPromotionDirection.value = sortDir;
            fetchRegistryBookEntrys(false);
        };

        return {
            fetchRegistryBookEntrys, nonPromotedEntries,
            totalNonPromotedEntries, currentTab,
            switchNonPromotedPage, tableRef, promotions,
            inPromotionEntries, totalInPromotionEntries,
            switchInPromotionPage, selectedPromotion
        };
    }
});
</script>
