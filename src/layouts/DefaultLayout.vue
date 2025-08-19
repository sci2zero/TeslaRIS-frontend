<template>

    <v-app>
        <SideBar class="h-full" />
        <v-main :class="['flex flex-col h-full transition-all duration-300', sidebarStore.mainMargin]">
            <div class="flex-1">
                <navbar variant="general" v-if="!hideLayout" />
                <!-- <breadcrumbs v-if="!hideLayout" /> -->
                <router-view />
                <cookie-consent v-if="!hideLayout" />
            </div>
            <footerbar v-if="!hideLayout" />
        </v-main>

    </v-app>

</template>

<script setup>
import Navbar from "@/components/core/Navbar.vue";
import Breadcrumbs from "@/components/core/Breadcrumbs.vue";
import CookieConsent from "@/components/core/CookieConsent.vue";
import Footerbar from "@/components/core/FooterBar.vue";
import SideBar from "@/components/core/SideBar.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useSidebarStore } from "@/stores/sidebarStore";
//   import Navbar from "@/components/Navbar.vue"
//   import Sidebar from "@/components/Sidebar.vue"

const route = useRoute();
const sidebarStore = useSidebarStore();

const hideLayout = computed(() => {
    return (
        route.name === "publicDissertationsReport" &&
        route.query.embed === "true"
    ) || route.name === "home";
});

</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .v-main {
        margin-left: 0 !important;
    }
}
</style>