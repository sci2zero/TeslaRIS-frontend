<template>
    <div>
        <!-- <h1>{{ $t('homeLabel') }}</h1> -->
        <v-container>
            <v-row class="mt-10 mb-10">
                <v-col cols="12" class="text-center">
                    <!-- Search bar -->
                    <search-bar-component @search="search"></search-bar-component>
                </v-col>
            </v-row>
        </v-container>
        <v-row class="py-5">
            <v-col cols="12">
                <v-card flat class="pa-4 header-card">
                    <v-card-title class="text-center">
                        <v-container>
                            <h2>CRIS UNS</h2>
                            <h3>(New Generation CRIS)</h3>
                            <p class="text-wrap">
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                        </v-container>
                    </v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-container>
            <v-row class="stats-cards">
                <!-- Kartice -->
                <v-col v-for="(item, index) in cardsData" :key="index" cols="4" class="my-10">
                    <v-card :to="item.path !== undefined ? '/' + $i18n.locale + '/' + item.path : undefined">
                        <v-card-title class="text-center">
                            {{ item.name }}
                        </v-card-title>
                        <v-card-text class="text-center">
                            <div>
                                <span class="big-number">
                                    {{ item.value }}
                                </span>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import SearchBarComponent from "../components/core/SearchBarComponent.vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import PersonService from "@/services/PersonService";
import { onMounted } from "vue";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import DocumentPublicationService from "@/services/DocumentPublicationService";

export default defineComponent({
    name: "HomeView",
    components: { SearchBarComponent },

    setup() {

        const router = useRouter();
        const i18n = useI18n();

        const personListLabel = computed(() => i18n.t("personListLabel"));
        const ouListLabel = computed(() => i18n.t("ouListLabel"));
        const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));

        const researcherCount = ref(0);
        const ouCount = ref(0);
        const publicationCount = ref(0);

        onMounted(() => {
            PersonService.getResearcherCount().then((response) => researcherCount.value = response.data);
            OrganisationUnitService.getOUCount().then((response) => ouCount.value = response.data);
            DocumentPublicationService.getDocumentCount().then((response) => publicationCount.value = response.data);
        });

        const cardsData = ref([
            {name: personListLabel, value: researcherCount, path:'persons'},
            {name: ouListLabel, value: ouCount, path: 'organisation-units'},
            {name: scientificResultsListLabel, value: publicationCount, path:'scientific-results'},
        ])

        const search = (tokenParams: string) => {
            let token = tokenParams;
            let prefix = "&tokens="
            while (token.includes(prefix)) {
                token = token.replace(prefix, " ");
            }

            prefix = "tokens="
            while (token.includes(prefix)) {
                token = token.replace(prefix, "");
            }
            
            router.push({name:"advancedSearch", query: { searchQuery: token  }})        
        }

        return {
        search,
        cardsData
        };

        
    },
});
</script>

<style>
    .big-number {
        font-size: 5em;
        line-height: normal;
        font-weight: bold;
        padding: 20px;

        display: inline-block;
        text-align: center;
        color: #272727
    }

    .stats-cards > :nth-child(1) .big-number {
        background: linear-gradient(0deg, hsla(186, 100%, 69%, 1) 0%, hsla(186, 100%, 69%, 0) 100%);
    }

    .stats-cards > :nth-child(2) .big-number {
        background: linear-gradient(0deg, hsla(152, 100%, 50%, 1) 0%, hsla(152, 100%, 50%, 0) 100%);
    }

    .stats-cards > :nth-child(3) .big-number {
        background: linear-gradient(0deg, hsla(35.34deg 100% 73.53%) 0%, hsla(186, 100%, 69%, 0) 100%);
    }

    .header-card {
        background: #2e868f;
        color: white;

        p {
            margin-top: 10px;
            line-height: 20px;
        }
    }
</style>