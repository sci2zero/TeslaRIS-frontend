<template>
    <h3 v-if="entityIdentifiersFiltered?.length > 0">
        {{ $t("otherIdentifiersLabel") }}
    </h3>
    <generic-crud-modal
        class="mt-5"
        :form-component="EntityIdentifierForm"
        :form-props="{
            applicableTypes: [containingEntityType, concreteEntityType, ApplicableEntityType.ALL],
            entityId: entityId,
            entityType: containingEntityType
        }"
        entity-name="EntityIdentifier"
        :read-only="!canEdit"
        @create="createIdentifier"
    />
    <v-expansion-panels v-model="openedPanel" class="mt-1">
        <v-expansion-panel
            v-for="(identifier, index) in entityIdentifiersFiltered"
            :key="identifier.id" :title="titles[index]">
            <v-expansion-panel-text>
                <v-row class="mt-4! mb-4!">
                    <p>{{ contents[index] }}</p>
                </v-row>
                <v-row class="align-left">
                    <div>
                        <generic-crud-modal
                            :form-component="EntityIdentifierForm"
                            :form-props="{ presetIdentifier: identifier, applicableTypes: identifier.identifierResponse.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                            entity-name=""
                            is-update
                            :read-only="!canEdit"
                            @update="updateIdentifier($event, identifier.id)"
                        />
                    </div>
                    <div class="ml-5">
                        <v-btn
                            v-if="canEdit"
                            density="compact"
                            @click.prevent="deleteIdentifier(identifier.id)">
                            {{ $t("deleteLabel") }}
                        </v-btn>
                    </div>
                    <div v-if="identifier.identifierResponse.uriPrefix" class="ml-5">
                        <v-btn
                            density="compact"
                            :href="identifier.identifierResponse.uriPrefix + identifier.value"
                            target="_blank"
                            rel="noopener noreferrer">
                            {{ $t("visitLinkLabel") }}
                        </v-btn>
                    </div>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, reactive, watch } from 'vue';
import { ref } from 'vue';
import { type EntityIdentifierResponse } from '@/models/IdentifierModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { ApplicableEntityType } from '@/models/Common';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import EntityIdentifierForm from '@/components/core/identifiers/EntityIdentifierForm.vue';


export default defineComponent({
    name: "EntityIdentifiersListComponent",
    components: { GenericCrudModal },
    props: {
        entityIdentifiers: {
            type: Array<EntityIdentifierResponse>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: false
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        containingEntityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        concreteEntityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["updated"],
    setup(props, { emit }) {
        const titles = ref<string[]>([]);
        const contents = ref<string[]>([]);
        const entityIdentifiersFiltered = reactive<EntityIdentifierResponse[]>([]);

        const openedPanel = ref();

        const i18n = useI18n();
        
        onMounted(() => {
            setIdentifiers();
        });

        watch(() => props.entityIdentifiers, () => {
            setIdentifiers();
        });

        watch(i18n.locale, () => {
            setIdentifiers();
        });

        const setIdentifiers = () => {
            entityIdentifiersFiltered.splice(0);
            titles.value.splice(0);
            contents.value.splice(0);

            if (props.entityIdentifiers) {
                props.entityIdentifiers.forEach(entityIdentifier => {
                    entityIdentifiersFiltered.push(entityIdentifier);
                    buildDisplayData(entityIdentifier);
                });
            }
        };

        const buildDisplayData = (entityIdentifier: EntityIdentifierResponse) => {
            const displayValue = entityIdentifier.value;

            const title = `${returnCurrentLocaleContent(entityIdentifier.identifierResponse.title)}: ${displayValue}`;

            titles.value.push(title);
            
            contents.value.push(`${returnCurrentLocaleContent(entityIdentifier.identifierResponse.description)}`);
        };

        const updateIdentifier = async (entityIdentifier: any, entityIdentifierId: number) => {
            if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityIdentifierService.updateDocumentIdentifier(entityIdentifier.identifier, entityIdentifierId);
            } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityIdentifierService.updateEventIdentifier(entityIdentifier.identifier, entityIdentifierId);
            }

            emit("updated");
        };

        const createIdentifier = async (entityIdentifier: any) => {
            if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityIdentifierService.createDocumentIdentifier(entityIdentifier.identifier);
            } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                await EntityIdentifierService.createEventIdentifier(entityIdentifier.identifier);
            }

            emit("updated");
        };

        const deleteIdentifier = async (entityIdentifierId: number) => {
            openedPanel.value = null;
            await EntityIdentifierService.deleteEntityIdentifier(entityIdentifierId);
            const index = entityIdentifiersFiltered.findIndex(identifier => identifier.id === entityIdentifierId);
            entityIdentifiersFiltered.splice(index, 1);
            titles.value.splice(index, 1);
            contents.value.splice(index, 1);
        };

        return {
            titles, contents,
            EntityIdentifierForm,
            entityIdentifiersFiltered,
            ApplicableEntityType,
            updateIdentifier,
            deleteIdentifier,
            openedPanel, createIdentifier
        };
    }
});
</script>
