<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="wide">
            <template #activator="scope">
                <v-btn
                    v-bind="scope.props"
                    class="inline-action"
                    v-on="scope.isActive">
                    {{ $t("printListLabel") }}
                </v-btn>
            </template>
            
            <v-card v-if="dialog" class="d-flex flex-column pa-4">
                <v-card-title>{{ $t("printListLabel") }}</v-card-title>
                <v-card-text>
                    <v-tabs
                        v-model="currentTab"
                        bg-color="blue-grey-lighten-5"
                        color="deep-purple-accent-4"
                        align-tabs="center"
                    >
                        <v-tab value="promotees">
                            {{ $t("personListLabel") }}
                        </v-tab>
                        <v-tab value="addresses">
                            {{ $t("addressesLabel") }}
                        </v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="currentTab">
                        <v-tabs-window-item value="promotees">
                            <v-list lines="two" class="w-100">
                                <v-list-item v-for="(value, key) in promotees" :key="key">
                                    <template #title>
                                        <div class="citation-container">
                                            <div ref="citations" class="citation" @click="selectText">
                                                <pre>{{ value }}</pre>
                                            </div>
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="addresses">
                            <v-list lines="two" class="w-100">
                                <v-list-item v-for="(value, key) in addresses" :key="key">
                                    <template #title>
                                        <div class="citation-container">
                                            <div ref="citations" class="citation" @click="selectText">
                                                <pre>{{ value }}</pre>
                                            </div>
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-tabs-window-item>
                    </v-tabs-window>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script lang="ts">
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import RegistryBookService from "@/services/thesisLibrary/RegistryBookService";


export default defineComponent({
    name: "PromotionPrintedLists",
    props: {
        promotionId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const currentTab = ref("promotees");
        const dialog = ref(false);
        const addresses = ref<string[]>([]);
        const promotees = ref<string[]>([]);

        watch(dialog, () => {
            if (dialog.value) {
                fetchAddresses();
                fetchPromotees();
            }
        });

        const fetchAddresses = () => {
            RegistryBookService.getAddressList(props.promotionId).then(response => {
                addresses.value = response.data;
            });
        };

        const fetchPromotees = () => {
            RegistryBookService.getPromoteesList(props.promotionId).then(response => {
                promotees.value = response.data;
            });
        };

        const selectText = (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            if (!target) return;

            const range = document.createRange();
            range.selectNodeContents(target);

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        return {
            dialog,
            addresses,
            currentTab,
            promotees,
            selectText
        };
    }
});
</script>

<style scoped>

.wide {
    width: 100%;
    max-width: 1000px;
}

</style>
