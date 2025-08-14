<template>
    <aside
        class="fixed z-40 h-screen w-24 bg-gray-900 text-white flex flex-col items-center py-6 border-r border-gray-800">
        <!-- Logo -->
        <router-link to="/"
            class="group relative flex items-center justify-center rounded-xl p-3 hover:bg-gray-800 transition-colors"
            aria-label="Logo">
            <span class="mdi mdi-flash text-4xl text-rose-400"></span>
            <span
                class="absolute left-20 top-1/2 -translate-y-1/2 rounded bg-gray-800/95 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">Logo</span>
        </router-link>

        <div class="mt-6 h-px w-12 bg-gray-800"></div>

        <!-- Menu -->
        <nav class="mt-6 flex flex-1 flex-col items-center gap-4">
            <router-link v-for="item in menuItems" :key="item.key" :to="item.to"
                class="group relative flex items-center justify-center rounded-xl p-4 transition-colors"
                :class="isActive(item.to) ? 'bg-gray-800 text-rose-300' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
                :aria-label="item.label">
                <span :class="['mdi', item.icon, 'text-3xl']"></span>
                <span
                    class="absolute left-20 top-1/2 -translate-y-1/2 rounded bg-gray-800/95 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">{{
                        item.label }}</span>
            </router-link>
        </nav>
    </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

type MenuItem = {
    key: string;
    label: string;
    to: string;
    icon: string; // mdi class
};

const route = useRoute();

const menuItems: MenuItem[] = [
    { key: 'resources', label: 'Resources', to: '/resources', icon: 'mdi-folder-multiple' },
    { key: 'search', label: 'Search', to: '/search', icon: 'mdi-magnify' },
    { key: 'library', label: 'Library', to: '/library', icon: 'mdi-book-open-variant' },
    { key: 'mservice', label: 'M-Service', to: '/m-service', icon: 'mdi-cog-outline' }
];

function isActive(path: string): boolean {
    return route.path === path || route.path.startsWith(path + '/');
}
</script>

<style scoped>
/* No additional CSS; Tailwind utility classes are used. */
</style>
