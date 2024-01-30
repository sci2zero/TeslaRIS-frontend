<template>
    <v-autocomplete
        v-model="selectedPublisher"
        :label="$t('publisherLabel')"
        :items="publishers"
        :custom-filter="((): boolean => true)"
        :auto-select-first="true"
        :no-data-text="$t('noDataMessage')"
        return-object
        @update:search="searchPublishers($event)"
        @update:model-value="sendContentToParent"
    ></v-autocomplete>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import PublisherService from '@/services/PublisherService';
import type { PublisherIndex } from '@/models/PublisherModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "PublisherAutocompleteSearch",
    emits: ["setInput"],
    setup(_, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const publishers = ref<{ title: string; value: number; }[]>([]);
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            sendContentToParent();
        });

        const searchPublishers = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                PublisherService.searchPublishers(params).then((response) => {
                    const listOfPublishers: { title: string, value: number }[] = [];
                    response.data.content.forEach((publisher: PublisherIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfPublishers.push({title: publisher.nameSr, value: publisher.databaseId});
                        } else {
                            listOfPublishers.push({title: publisher.nameOther, value: publisher.databaseId});
                        }
                    })
                    publishers.value = listOfPublishers;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("setInput", selectedPublisher.value);
        };

        const clearInput = () => {
            selectedPublisher.value = searchPlaceholder;
            sendContentToParent();
        };

        return {
            publishers, selectedPublisher, searchPublishers,
            sendContentToParent, clearInput
        };
    }
});
</script>
