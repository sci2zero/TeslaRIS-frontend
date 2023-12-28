<template>
    <v-app>
        <v-main>
            <navbar />
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import navbar from "@/components/core/Navbar.vue";

    export default defineComponent({
        name: "App",
        components: {navbar}
    });
</script>

<style>
    /* @import "./assets/main.css"; */
</style>