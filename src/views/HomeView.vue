<template>
    <div>
        <!-- <h1>{{ $t('homeLabel') }}</h1> -->
        <v-row class="mt-10 mb-10">
            <v-col cols="12" class="text-center">
                <!-- Search bar -->
                <search-bar-component @search="search"></search-bar-component>
            </v-col>
        </v-row>

        <v-row class="py-4">
            <v-col cols="12">
                <v-card flat class="pa-4 primary">
                    <v-card-title class="text-center">
                        <h2>CRIS UNS</h2>
                        <h3>(New Generation CRIS)</h3>
                        <p class="text-wrap">
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        </p>
                    </v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <!-- Kartice -->
            <v-col cols="4">
                <v-card>
                    <v-card-title class="text-center">
                        Researchers
                    </v-card-title>
                    <v-card-text class="text-center">
                        <span class="big-number">
                            {{ brojA }}
                        </span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card>
                    <v-card-title class="text-center">
                        Broj B
                    </v-card-title>
                    <v-card-text class="text-center">
                        <span class="big-number">
                            {{ brojB }}
                        </span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card>
                    <v-card-title class="text-center">
                        Broj C
                    </v-card-title>
                    <v-card-text class="text-center">
                        <span class="big-number">
                            {{ brojC }}
                        </span>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import SearchBarComponent from "../components/core/SearchBarComponent.vue";

export default defineComponent({
    name: "HomeView",
    components: { SearchBarComponent },

    setup() {
        // const search = ref('');
        const brojA = ref(10);
        const brojB = ref(20);
        const brojC = ref(30);

        const search = (tokenParams: string) => {return tokenParams}


        return {
        search,
        brojA,
        brojB,
        brojC
        };

        
    },
});
</script>

<style>
    .big-number {
        font-size: 6em;
        height: 158px;
        line-height: normal;
        font-weight: bold;

        background: linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 99%);

        background: -moz-linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 99%);

        background: -webkit-linear-gradient(90deg, hsla(152, 100%, 50%, 1) 0%, hsla(186, 100%, 69%, 1) 99%);
        padding: 20px;

        display: inline;
        text-align: center;
    }
</style>