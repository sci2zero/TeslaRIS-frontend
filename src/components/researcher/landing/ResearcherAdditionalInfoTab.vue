<template>
    <div class="mt-4 space-y-6">
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

        <v-row>
            <v-col cols="12" lg="6" class="pb-0">
                <expertise-or-skill-list
                    :expertise-or-skills="person?.expertisesOrSkills"
                    :person="person"
                    :can-edit="canEdit"
                    @crud="emit('refresh')"
                />

                <div class="mt-4">
                    <prize-list
                        :prizes="person?.prizes"
                        :person="person"
                        :can-edit="canEdit"
                        @crud="emit('refresh')"
                    />
                </div>
            </v-col>

            <v-col cols="12" lg="6">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container overflow-x-auto">
                        <person-involvement-modal
                            :read-only="!canEdit"
                            :researcher-id="person?.id"
                            @create="emit('add-involvement', $event)"
                        />

                        <div><h2>{{ $t("involvementsLabel") }}</h2></div>
                        <strong v-if="employments.length === 0 && education.length === 0 && memberships.length === 0">
                            {{ $t("notYetSetMessage") }}
                        </strong>
                        <br />
                        <div v-if="employments.length > 0">
                            <h3>{{ $t("employmentsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list
                            :involvements="employments"
                            :person="person"
                            :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')"
                        />
                        <div v-if="education.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("educationLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list
                            :involvements="education"
                            :person="person"
                            :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')"
                        />
                        <div v-if="memberships.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("membershipsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list
                            :involvements="memberships"
                            :person="person"
                            :can-edit="canEdit"
                            @refresh-involvements="emit('refresh')"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

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

<style scoped>
.edit-pen-container {
    position: relative;
}

.edit-pen-container :deep(.edit-pen) {
    top: 0;
    right: 0;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover :deep(.edit-pen) {
    opacity: 0.3;
}

.edit-pen-container :deep(.edit-pen:hover) {
    opacity: 1;
}

@media (hover: none), (max-width: 768px) {
    .edit-pen-container :deep(.edit-pen) {
        opacity: 1;
    }
}
</style>
