<template>
    <div id="footer">
        <v-footer class="bg-cyan-lighten-5 pa-5" absolute inset app>
            <v-row justify="space-between" no-gutters>
                <div class="d-flex flex-wrap">
                    <v-btn
                        v-for="link in links"
                        :key="link.title"
                        size="x-small"
                        color="black"
                        :active="false"
                        variant="text"
                        class="mx-2"
                        rounded="xl"
                        :to="link.path !== undefined ? '/' + $i18n.locale + '/' + link.path : undefined"
                    >
                        {{ link.title }}
                    </v-btn>
                </div>
                <div class="text-center" cols="12">
                    <version-link></version-link>
                </div>
            </v-row>
        </v-footer>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import VersionLink from './VersionLink.vue';


export default defineComponent(
    {
        name: "FooterBar",
        components: { VersionLink },
        setup() {
            const appVersion = import.meta.env.VITE_APP_VERSION;

            const i18n = useI18n();
            const homeLabel = computed(() => i18n.t("homeLabel"));

            const personListLabel = computed(() => i18n.t("personListLabel"));
            const ouListLabel = computed(() => i18n.t("ouListLabel"));
            const scientificResultsListLabel = computed(() => i18n.t("scientificResultsListLabel"));
            const simpleSearchLabel = computed(() => i18n.t("simpleSearchLabel"));
            const contactLabel = computed(() => i18n.t("contactLabel"));


            const links = ref([
                    { title: homeLabel, path: ""},
                    { title: personListLabel, path: "persons"},
                    { title: ouListLabel, path: "organisation-units"},
                    { title: scientificResultsListLabel, path: "scientific-results"},
                    { title: simpleSearchLabel, path: "advanced-search"},
                    { title: contactLabel, path: "contact"},
                ]);


            return {
                links, appVersion
            };
        }
    });
</script>
