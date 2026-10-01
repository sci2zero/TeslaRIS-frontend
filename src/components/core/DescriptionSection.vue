<template>
    <landing-section-card
        :title="getSectionTitle()"
        :icon="sectionIcon"
        :icon-class="sectionIconClass"
        padded
    >
        <template v-if="canEdit" #action>
            <generic-crud-modal
                :form-component="DescriptionOrBiographyUpdateForm"
                :form-props="{ presetDescriptionOrBiography: description ? description : [], placeholderLabel: getSectionTitle() }"
                :entity-name="getEntityName()"
                is-update
                is-section-update
                wide
                @update="emitToParent"
            >
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        variant="outlined"
                        size="small"
                        class="text-none"
                        prepend-icon="mdi-pencil-outline">
                        {{ $t("editActionLabel") }}
                    </v-btn>
                </template>
            </generic-crud-modal>
        </template>

        <p
            v-if="!hasDescription"
            class="text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <rich-text-editor
            v-else
            v-model="descriptionDisplay"
            :editable="false"
        />
    </landing-section-card>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { MultilingualContent } from '@/models/Common';
import GenericCrudModal from './GenericCrudModal.vue';
import DescriptionOrBiographyUpdateForm from './update/DescriptionOrBiographyUpdateForm.vue';
import RichTextEditor from './RichTextEditor.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "DescriptionSection",
    components: { GenericCrudModal, RichTextEditor, LandingSectionCard },
    props: {
        canEdit: {
            type: Boolean,
            default: false
        },
        isBiography: {
            type: Boolean,
            default: false
        },
        isGeneralDescription: {
            type: Boolean,
            default: false
        },
        isExtendedAbstract: {
            type: Boolean,
            default: false
        },
        isRemark: {
            type: Boolean,
            default: false
        },
        description: {
            type: Object as PropType<MultilingualContent[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const descriptionDisplay = ref("");

        const i18n = useI18n();

        const emitToParent = (description: MultilingualContent[]) => {
            emit("update", description);
        };

        onMounted(() => {
            displayDescription();
        });

        watch([() => props.description, i18n.locale], () => {
            displayDescription();
        });

        const displayDescription = () => {
            if (!props.description) {
                descriptionDisplay.value = "";
                return;
            }
            
            descriptionDisplay.value = (returnCurrentLocaleContent(props.description) as string) || "";
        };

        const hasDescription = computed(() =>
            descriptionDisplay.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 0
        );

        const getSectionTitle = () => {
            if (props.isGeneralDescription) {
                return i18n.t('descriptionLabel');
            } else if (props.isBiography) {
                return i18n.t("biographyLabel");
            } else if (props.isExtendedAbstract) {
                return i18n.t("extendedAbstractLabel");
            } else if (props.isRemark) {
                return i18n.t("remarkLabel");
            }

            return i18n.t("abstractLabel")
        };

        const getEntityName = () => {
            if (props.isBiography) {
                return "Biography";
            } else if (props.isExtendedAbstract) {
                return "ExtendedAbstract";
            } else if (props.isRemark) {
                return "Remark";
            }

            return props.isGeneralDescription ? "" : "Abstract";
        };

        const sectionIcon = computed(() => {
            if (props.isBiography) {
                return "mdi-account";
            }
            if (props.isRemark) {
                return "mdi-comment-text-outline";
            }
            if (props.isExtendedAbstract) {
                return "mdi-file-document-outline";
            }
            return "mdi-text-box-outline";
        });

        const sectionIconClass = computed(() => {
            if (props.isBiography) {
                return "bg-indigo-50 text-indigo-600";
            }
            if (props.isRemark) {
                return "bg-slate-100 text-slate-600";
            }
            if (props.isExtendedAbstract) {
                return "bg-cyan-50 text-cyan-700";
            }
            return "bg-blue-50 text-blue-600";
        });

        return { 
            emitToParent, returnCurrentLocaleContent,
            DescriptionOrBiographyUpdateForm,
            descriptionDisplay, getSectionTitle,
            getEntityName, sectionIcon, sectionIconClass,
            hasDescription
        };
    },
});
</script>
