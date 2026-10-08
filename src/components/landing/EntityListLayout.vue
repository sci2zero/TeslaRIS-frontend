<template>
    <main class="entity-list-layout">
        <header class="entity-list-header">
            <span class="entity-list-header__icon"><v-icon :icon="icon" size="24" /></span>
            <h1>{{ title }}</h1>
        </header>
        <section class="entity-list-content">
            <slot />
        </section>
    </main>
</template>
<script setup lang="ts">
defineProps<{ title: string; icon: string }>();
</script>
