<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <div class="edit-pen">
                        <v-btn icon variant="outlined" size="small"> 
                            <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                        </v-btn>
                    </div>
                    <div><b>{{ $t("authorsLabel") }}</b></div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    
                    <div v-for="(contribution, index) in contributionList" :key="index" class="py-5">
                        <localized-link :to="'persons/' + contribution.personId">
                            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isMainContributor ? ` (${$t("mainContributorLabel")})` : "") + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") }}</strong></h4>
                        </localized-link>
                        <h5 v-if="contribution.contact?.contactEmail">
                            <strong>{{ `${$t("emailLabel")}: ${contribution.contact?.contactEmail}` }}</strong>
                        </h5>
                        <v-divider v-if="index < (contributionList ? contributionList.length : 1) - 1 " class="mt-10"></v-divider>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import { defineComponent, type PropType } from 'vue';
import LocalizedLink from '../localization/LocalizedLink.vue';


export default defineComponent({
    name: "PersonDocumentContributionList",
    components: { LocalizedLink },
    props: {
        contributionList: {
            type: Array as PropType<PersonDocumentContribution[] | undefined>,
            required: true
        }
    },
    setup() {
        //
    },
});
</script>

<style scoped>
    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }

</style>
