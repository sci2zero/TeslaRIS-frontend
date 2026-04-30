<template>
    <div>
        <h3 v-if="entityIdentifiersFiltered?.length > 0">
            {{ $t("otherIdentifiersLabel") }}
        </h3>
        <div class="crud-modal-wrapper mt-2">
            <generic-crud-modal
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
        </div>
        <v-expansion-panels v-model="openedPanel" class="mt-1">
            <v-expansion-panel
                v-for="(identifier, index) in entityIdentifiersFiltered"
                :key="identifier.id" :title="titles[index]">
                <v-expansion-panel-text>
                    <v-row class="mt-2">
                        <v-col>
                            <p>{{ contents[index] }}</p>
                        </v-col>
                    </v-row>
                    <v-row class="actions-row">
                        <generic-crud-modal
                            class="mt-2"
                            :form-component="EntityIdentifierForm"
                            :form-props="{ presetIdentifier: identifier, applicableTypes: identifier.identifierResponse.applicableEntityTypes, entityId: entityId, entityType: containingEntityType }"
                            entity-name=""
                            is-update
                            :read-only="!canEdit"
                            @update="updateIdentifier($event, identifier.id)"
                        />
                        <v-btn
                            v-if="canEdit"
                            class="mb-3"
                            density="compact"
                            variant="text"
                            color="error"
                            @click.prevent="deleteIdentifier(identifier.id)">
                            {{ $t("deleteLabel") }}
                        </v-btn>
                        <v-btn
                            v-if="identifier.identifierResponse.uriPrefix"
                            class="mb-3"
                            density="compact"
                            variant="text"
                            :href="identifier.identifierResponse.uriPrefix + identifier.value"
                            target="_blank"
                            rel="noopener noreferrer">
                            {{ $t("visitLinkLabel") }}
                        </v-btn>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <toast v-model="snackbar" :message="message" />
    </div>
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
import Toast from '../Toast.vue';


export default defineComponent({
    name: "EntityIdentifiersListComponent",
    components: { GenericCrudModal, Toast },
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
        const message = ref("");
        const snackbar = ref(false);

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
            try {
                if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                await EntityIdentifierService.updateDocumentIdentifier(entityIdentifier.identifier, entityIdentifierId);
                } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                    await EntityIdentifierService.updateEventIdentifier(entityIdentifier.identifier, entityIdentifierId);
                } else if (props.containingEntityType === ApplicableEntityType.PUBLICATION_SERIES) {
                    await EntityIdentifierService.updatePublicationSeriesIdentifier(entityIdentifier.identifier, entityIdentifierId);
                } else if (props.containingEntityType === ApplicableEntityType.ORGANISATION_UNIT) {
                    await EntityIdentifierService.updateOrganisationUnitIdentifier(entityIdentifier.identifier, entityIdentifierId);
                } else if (props.containingEntityType === ApplicableEntityType.PERSON) {
                    await EntityIdentifierService.updatePersonIdentifier(entityIdentifier.identifier, entityIdentifierId);
                }
            } catch (_error) {
                message.value = i18n.t("identifierInUseMessage");
                snackbar.value = true;
            }

            emit("updated");
        };

        const createIdentifier = async (entityIdentifier: any) => {
            try {
                if (props.containingEntityType === ApplicableEntityType.DOCUMENT) {
                    await EntityIdentifierService.createDocumentIdentifier(entityIdentifier.identifier);
                } else if (props.containingEntityType === ApplicableEntityType.EVENT) {
                    await EntityIdentifierService.createEventIdentifier(entityIdentifier.identifier);
                } else if (props.containingEntityType === ApplicableEntityType.PUBLICATION_SERIES) {
                    await EntityIdentifierService.createPublicationSeriesIdentifier(entityIdentifier.identifier);
                } else if (props.containingEntityType === ApplicableEntityType.PERSON) {
                    await EntityIdentifierService.createPersonIdentifier(entityIdentifier.identifier);
                } else if (props.containingEntityType === ApplicableEntityType.ORGANISATION_UNIT) {
                    await EntityIdentifierService.createOrganisationUnitIdentifier(entityIdentifier.identifier);
                }
            } catch (_error) {
                message.value = i18n.t("identifierInUseMessage");
                snackbar.value = true;
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
            updateIdentifier, message,
            deleteIdentifier, snackbar,
            openedPanel, createIdentifier
        };
    }
});
</script>

<style scoped>
    .identifiers-section h3 {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: rgba(var(--v-theme-on-surface), 0.6);
        margin-bottom: 6px;
        margin-top: 12px;
    }

    :deep(.v-expansion-panel) {
        border-left: 3px solid rgb(var(--v-theme-primary));
        margin-bottom: 4px;
        border-radius: 6px !important;
        background: rgba(var(--v-theme-surface), 1) !important;
    }

    :deep(.v-expansion-panel-title) {
        font-weight: 600;
        font-size: 0.9rem;
        min-height: 40px;
        padding: 8px 14px;
    }

    :deep(.v-expansion-panel-title:hover) {
        background: rgba(var(--v-theme-primary), 0.05);
    }

    :deep(.v-expansion-panel-text__wrapper) {
        padding: 4px 14px 12px;
    }

    :deep(.v-expansion-panel-text p) {
        font-size: 0.875rem;
        color: rgba(var(--v-theme-on-surface), 0.65);
        margin: 0 0 8px 0;
        line-height: 1.5;
    }

    :deep(.v-expansion-panels) {
        gap: 2px;
    }

    .actions-row {
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        padding-top: 4px;
    }

    :deep(.actions-row .v-btn) {
        text-transform: none;
        letter-spacing: 0;
        font-size: 0.8rem;
        font-weight: 500;
        opacity: 0.85;
    }

    :deep(.actions-row .v-btn:hover) {
        opacity: 1;
    }

    :deep(.v-btn[href]) {
        text-transform: none;
        letter-spacing: 0;
        font-size: 0.8rem;
        font-weight: 500;
        color: rgb(var(--v-theme-primary));
    }

    .crud-modal-wrapper {
        margin-bottom: 4px;
    }
</style>
