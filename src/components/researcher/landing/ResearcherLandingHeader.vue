<template>
    <div class="mb-8">
        <generic-crud-modal
            v-if="canEdit"
            ref="personUpdateModalRef"
            hide-activator
            :form-component="PersonUpdateForm"
            :form-props="{ presetPerson: person }"
            entity-name="Person"
            is-update
            is-section-update
            :read-only="!canEdit"
            @update="emit('update', $event)"
        />
        <div class="flex flex-col lg:flex-row items-center lg:items-start w-full min-w-0">
            <!-- Profile Image -->
            <div class="flex-shrink-0 mb-6 lg:mb-0 lg:mr-12">
                <div class="relative">
                    <div class="w-28 h-28 sm:size-48 lg:size-64 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-slate-100">
                        <person-profile-image
                            :filename="person?.imageServerFilename"
                            :person-id="person?.id"
                            :can-edit="canEdit"
                        />
                        <!-- <img
                            src="https://media.licdn.com/dms/image/v2/C5603AQGxtzCVK6GaHA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1563263024808?e=2147483647&v=beta&t=RMkrpatN3DzSBMhrc7DVkuG98ug5ixG-bwYh5yO-bd0"
                            alt="Researcher Profile" class="w-full h-full object-cover" /> -->
                    </div>
                    <!-- Academic Status Badge -->
                    <div class="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 max-w-[85%] bg-emerald-600 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white truncate">
                        {{ props.person?.personalInfo.displayTitle && props.person.personalInfo.displayTitle.length > 0 ? returnCurrentLocaleContent(props.person.personalInfo.displayTitle) : $t("researcherLabel") }}
                    </div>
                </div>
            </div>
            
            <div class="flex-1 min-w-0 w-full text-center lg:text-left">
                <!-- Name -->
                <div class="flex items-start sm:items-center justify-center lg:justify-between w-full gap-2 sm:gap-3 mb-3 min-w-0">
                    <h1 class="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 leading-tight tracking-tight min-w-0 break-words">
                        {{ props.researcherName }}
                    </h1>
                    <v-menu v-if="canEdit" location="bottom end">
                        <template #activator="{ props: menuProps }">
                            <UiButton variant="outline" size="icon" class="shrink-0" v-bind="menuProps">
                                <span class="mdi mdi-dots-vertical text-xl"></span>
                            </UiButton>
                        </template>
                        <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                            <v-list-item
                                prepend-icon="mdi-pencil-outline"
                                :title="$t('updatePersonLabel')"
                                @click="openPersonEditModal"
                            />
                        </v-list>
                    </v-menu>
                </div>


                <!-- Affiliation -->
                <div class="mb-6 lg:mb-8 px-1">
                    <p class="text-base sm:text-xl font-semibold text-slate-600 font-sans break-words">
                        <localized-link
                            v-if="primaryEmployment?.organisationUnitId"
                            :to="'organisation-units/' + primaryEmployment?.organisationUnitId"
                            class="font-medium text-gray-900 underline"
                        >
                            {{ primaryEmployment?.organisationUnitName ? returnCurrentLocaleContent(primaryEmployment.organisationUnitName) : "" }}
                        </localized-link>
                    </p>
                    <p class="text-sm text-slate-500 font-sans">
                        {{ primaryEmployment?.employmentPosition ? getEmploymentPositionTitleFromValueAutoLocale(primaryEmployment.employmentPosition) : "" }}
                    </p>
                </div>

                <!-- Academic Identifiers -->
                <div class="mb-6 flex justify-center lg:justify-start w-full min-w-0">
                    <div class="space-y-3 w-full max-w-full">
                        <!-- ORCID -->
                        <div v-if="props.person?.personalInfo.orcid" class="flex items-center justify-start gap-3 min-w-0">
                            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                                <span class="text-white text-sm font-bold">iD</span>
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">ORCID</span>
                                <span class="min-w-0 break-all">
                                    <identifier-link
                                        :identifier="props.person.personalInfo.orcid"
                                        type="orcid"
                                        compact
                                    />
                                </span>
                            </div>
                        </div>

                        <!-- SC Number -->
                        <div v-if="props.person?.personalInfo.scopusAuthorId" class="flex items-center justify-start gap-3 min-w-0">
                            <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                                <span class="text-white text-sm font-bold">SC</span>
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Scopus Author ID</span>
                                <span class="min-w-0 break-all">
                                    <identifier-link
                                        :identifier="props.person.personalInfo.scopusAuthorId"
                                        type="scopus_author"
                                        compact
                                    />
                                </span>
                            </div>
                        </div>

                        <!-- OpenAlex Number -->
                        <div v-if="props.person?.personalInfo.openAlexId" class="flex items-center justify-start gap-3 min-w-0">
                            <div class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shadow-md shrink-0">
                                <span class="text-black text-sm font-bold">OA</span>
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">OpenAlex ID</span>
                                <span class="min-w-0 break-all">
                                    <identifier-link
                                        :identifier="props.person.personalInfo.openAlexId"
                                        type="open_alex"
                                        compact
                                    />
                                </span>
                            </div>
                        </div>

                        <!-- WOS Number -->
                        <div v-if="props.person?.personalInfo.webOfScienceResearcherId" class="flex items-center justify-start gap-3 min-w-0">
                            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                                <span class="text-white text-sm font-bold">WoS</span>
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Researcher ID (Web of Science)</span>
                                <span class="min-w-0 break-all">
                                    <identifier-link
                                        :identifier="props.person.personalInfo.webOfScienceResearcherId"
                                        type="researcher_id"
                                        compact
                                    />
                                </span>
                            </div>
                        </div>

                        <!-- Email -->
                        <div v-if="props.person?.personalInfo.contact?.contactEmail" class="flex items-center justify-start gap-3 min-w-0">
                            <div class="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                                <span class="mdi mdi-email text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</span>
                                <span class="min-w-0 break-all">
                                    <identifier-link
                                        v-if="person?.personalInfo.contact?.contactEmail"
                                        :identifier="person?.personalInfo.contact.contactEmail"
                                        type="email"
                                        compact
                                    />
                                    <span v-else>-</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="$slots.actions"
                    class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start w-full"
                >
                    <slot name="actions"></slot>
                </div>
            </div>
        </div>

        <!-- Data Quality -->
        <div v-if="person?.id" class="mt-8">
            <data-quality-remarks-dialog
                :entity-type="EntityType.PERSON"
                :entity-id="person?.id"
                prominent
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { Employment } from '@/models/InvolvementModel';
import type { PersonalInfo, PersonResponse } from '@/models/PersonModel';
import PersonProfileImage from '@/components/person/PersonProfileImage.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import DataQualityRemarksDialog from '@/components/core/revisions/DataQualityRemarksDialog.vue';
import { EntityType } from '@/models/MergeModel';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PersonUpdateForm from '@/components/person/update/PersonUpdateForm.vue';
import { UiButton } from '@/components/ui/button';

interface Props {
    person: PersonResponse | undefined;
    researcherName: string;
    employments: Employment[];
    canEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    update: [personalInfo: PersonalInfo];
}>();

const personUpdateModalRef = ref<{ dialog: boolean } | null>(null);

const openPersonEditModal = () => {
    if (personUpdateModalRef.value) {
        personUpdateModalRef.value.dialog = true;
    }
};

const primaryEmployment = computed(() =>
    props.employments.length > 0
        ? props.employments.reduce((a, b) =>
            (!b.dateFrom ? b : !a.dateFrom ? a :
             (!b.dateTo && a.dateTo) ? b :
             (b.dateTo && !a.dateTo) ? a :
             new Date(b.dateFrom || 0) > new Date(a.dateFrom || 0) ? b : a)
        )
        : null
);
</script>

<style scoped>
.font-serif {
    font-family: 'Georgia', 'Times New Roman', serif;
}

.prose {
    color: #374151;
}

.prose p {
    margin-bottom: 0.75rem;
}

.prose p:last-child {
    margin-bottom: 0;
}
</style>
