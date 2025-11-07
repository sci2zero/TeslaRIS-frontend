<template>
    <v-app>
        <SideBar class="h-full" />
        <v-main :class="['flex flex-col h-full transition-all duration-300', sidebarStore.mainMargin]">
            <div class="flex-1">
                <navbar v-if="!hideLayout && !hideNavbar" variant="general" />
                <!-- <breadcrumbs v-if="!hideLayout" /> -->
                <router-view />
            </div>
            <footerbar v-if="!hideLayout" />
        </v-main>
    </v-app>
</template>

<script setup>
import Navbar from "@/components/core/MainNavbar.vue";
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
    );
});

const hideNavbar = computed(() => {
    return route.name === "home";
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