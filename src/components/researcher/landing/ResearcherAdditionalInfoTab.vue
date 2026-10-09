<template>
    <div class="mt-4 space-y-4">
        <researcher-personal-details
            :person="person"
            :employments="employments"
            :can-edit="canEdit"
            :research-area="researchArea"
            :country-name="countryName"
            :private-country-name="privateCountryName"
            @update="emit('update', $event)"
        />

        <keyword-list
            :keywords="keywords"
            :can-edit="canEdit"
            @search-keyword="emit('search-keyword', $event)"
            @update="emit('update-keywords', $event)"
        />

        <description-section
            :description="biography"
            :can-edit="canEdit"
            is-biography
            @update="emit('update-biography', $event)"
        />

        <div class="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <div class="min-w-0 space-y-4">
                <expertise-or-skill-list
                    :expertise-or-skills="person?.expertisesOrSkills"
                    :person="person" :can-edit="canEdit"
                    @crud="emit('refresh')" />
                <prize-list
                    :prizes="person?.prizes"
                    :person="person" :can-edit="canEdit"
                    @crud="emit('refresh')" />
            </div>
            <landing-section-card
                class="min-w-0 [&>header]:flex-wrap [&>header>h3]:min-w-24"
                :title="$t('involvementsLabel')"
                :count="employments.length + education.length + memberships.length"
                icon="mdi-domain"
                icon-class="bg-indigo-50 text-indigo-600">
                <template v-if="canEdit" #action>
                    <person-involvement-modal
                        :read-only="!canEdit" :researcher-id="person?.id"
                        @create="emit('add-involvement', $event)" />
                </template>
                <p
                    v-if="employments.length === 0 && education.length === 0 && memberships.length === 0"
                    class="px-4 py-5 text-sm text-slate-500">
                    {{ $t("notYetSetMessage") }}
                </p>
                <div class="divide-y divide-slate-100">
                    <section v-if="employments.length > 0">
                        <h4 class="bg-slate-50/50 px-4 py-2 text-xs font-semibold text-slate-500">
                            {{ $t("employmentsLabel") }}
                        </h4>
                        <involvement-list
                            :involvements="employments" :person="person" :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')" />
                    </section>
                    <section v-if="education.length > 0">
                        <h4 class="bg-slate-50/50 px-4 py-2 text-xs font-semibold text-slate-500">
                            {{ $t("educationLabel") }}
                        </h4>
                        <involvement-list
                            :involvements="education" :person="person" :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')" />
                    </section>
                    <section v-if="memberships.length > 0">
                        <h4 class="bg-slate-50/50 px-4 py-2 text-xs font-semibold text-slate-500">
                            {{ $t("membershipsLabel") }}
                        </h4>
                        <involvement-list
                            :involvements="memberships" :person="person" :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')" />
                    </section>
                </div>
            </landing-section-card>
        </div>

        <UiButton
            v-if="isAdmin"
            variant="outline"
            size="sm"
            @click="emit('migrate-to-unmanaged')"
        >
            {{ $t("migrateToUnmanagedResearcherLabel") }}
        </UiButton>
    </div>
</template>

<script setup lang="ts">
import type { MultilingualContent } from "@/models/Common";
import type { AssessmentResearchArea } from "@/models/AssessmentModel";
import type { Education, Employment, Membership } from "@/models/InvolvementModel";
import type { PersonalInfo, PersonResponse } from "@/models/PersonModel";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import PersonInvolvementModal from "@/components/person/involvement/PersonInvolvementModal.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import InvolvementList from "@/components/person/involvement/InvolvementList.vue";
import PrizeList from "@/components/person/prize/PrizeList.vue";
import ExpertiseOrSkillList from "@/components/person/expertiseOrSkill/ExpertiseOrSkillList.vue";
import ResearcherPersonalDetails from "@/components/researcher/landing/ResearcherPersonalDetails.vue";
import { UiButton } from "@/components/ui/button";

interface Props {
    person: PersonResponse | undefined;
    keywords: MultilingualContent[];
    biography: MultilingualContent[];
    canEdit: boolean;
    isAdmin: boolean;
    employments: Employment[];
    education: Education[];
    memberships: Membership[];
    researchArea?: AssessmentResearchArea;
    countryName?: string;
    privateCountryName?: string;
}

defineProps<Props>();

const emit = defineEmits<{
    (e: "update", personalInfo: PersonalInfo): void;
    (e: "search-keyword", keyword: string): void;
    (e: "update-keywords", keywords: MultilingualContent[]): void;
    (e: "update-biography", biography: MultilingualContent[]): void;
    (e: "refresh"): void;
    (e: "add-involvement", involvement: Education | Membership | Employment): void;
    (e: "migrate-to-unmanaged"): void;
}>();
</script>
