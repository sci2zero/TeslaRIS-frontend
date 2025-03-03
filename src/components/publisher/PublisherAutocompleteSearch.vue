<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedPublisher.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedPublisher"
                :label="$t('publisherLabel')"
                :items="publishers"
                :custom-filter="((): boolean => true)"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchPublishers($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <generic-crud-modal
                :form-component="PublisherSubmissionForm"
                entity-name="Publisher"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedPublisher"
            />
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedPublisher.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import PublisherService from '@/services/PublisherService';
import type { Publisher, PublisherIndex } from '@/models/PublisherModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import PublisherSubmissionForm from './PublisherSubmissionForm.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';


export default defineComponent({
    name: "PublisherAutocompleteSearch",
    components: { GenericCrudModal },
    props: {
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const publishers = ref<{ title: string; value: number; }[]>([]);
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedPublisher.value = props.modelValue;
            }
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
            emit("update:modelValue", selectedPublisher.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedPublisher.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedPublisher.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedPublisher = (publisher: Publisher) => {
            let title: string | undefined;
            publisher.name.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && publisher.name.length > 0) {
                title = publisher.name[0].content;
            }
            const toSelect = {title: title as string, value: publisher.id as number};
            publishers.value.push(toSelect);
            selectedPublisher.value = toSelect;
            sendContentToParent();
        };

        return {
            publishers, selectedPublisher, searchPublishers,
            sendContentToParent, clearInput, selectNewlyAddedPublisher,
            PublisherSubmissionForm
        };
    }
});
</script>
