<template>
    <draggable
        :list="contributionList"
        group="documentContributions"
        item-key="id"
        :disabled="!canReorder"
        @change="reorderContributors">
        <div v-for="(contribution, index) in contributionList" :key="contribution.id" class="py-5">
            <localized-link v-if="contribution.personId" :to="'persons/' + contribution.personId">
                <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") + (contribution.isBoardPresident ? ` (${$t("boardPresidentLabel")})` : "") }}</strong></h4>
            </localized-link>
            <h4 v-else>
                <strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") + (contribution.isBoardPresident ? ` (${$t("boardPresidentLabel")})` : "") }}</strong>
            </h4>
            <strong v-if="contribution.employmentTitle">{{ getEmploymentTitleFromValueAutoLocale(contribution.employmentTitle) }}</strong>
            <v-icon v-if="contribution.employmentTitle && contribution.personalTitle" icon="mdi-circle-small" />
            <strong v-if="contribution.personalTitle">{{ getPersonalTitleFromValueAutoLocale(contribution.personalTitle) }}</strong>
            <div v-if="contribution.institutionIds?.length === 0">
                <em>
                    {{ returnCurrentLocaleContent(contribution.displayAffiliationStatement) }}
                </em>
            </div>
            <div v-for="(mc, idx) in contribution.displayInstitutionNames" v-else :key="idx">
                <em>
                    {{ returnCurrentLocaleContent(mc) }}
                </em>
            </div>
            <h5 v-if="loginStore.userLoggedIn && contribution.contact?.contactEmail">
                <strong>{{ `${$t("emailLabel")}: ${contribution.contact?.contactEmail}` }}</strong>
            </h5>
            <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
        </div>
    </draggable>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/documentContributionType';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import { VueDraggableNext } from 'vue-draggable-next'
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useLoginStore } from '@/stores/loginStore';
import { getEmploymentTitleFromValueAutoLocale } from '@/i18n/employmentTitle';
import { getPersonalTitleFromValueAutoLocale } from '@/i18n/personalTitle';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "PersonDocumentContributionList",
    components: { LocalizedLink, draggable: VueDraggableNext  },
    props: {
        contributionList: {
            type: Array as PropType<PersonDocumentContribution[]>,
            required: true
        },
        documentId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        canReorder: {
            type: Boolean,
            default: false
        }
    },
    emits: ["positionsChanged"],
    setup(props, {emit}) {
        const loginStore = useLoginStore();

        const reorderContributors = (event: any) => {
            if(event.moved.newIndex !== event.moved.oldIndex) {
                DocumentPublicationService.reorderContribution(
                    props.documentId as number,
                    props.contributionList[event.moved.newIndex].id as number,
                    event.moved.oldIndex + 1,
                    event.moved.newIndex + 1
                ).then(() => {
                    emit("positionsChanged")
                });
            }
        };

        return { 
            getTitleFromValueAutoLocale,
            reorderContributors, loginStore,
            getEmploymentTitleFromValueAutoLocale,
            getPersonalTitleFromValueAutoLocale,
            returnCurrentLocaleContent
        };
    },
});
</script>
