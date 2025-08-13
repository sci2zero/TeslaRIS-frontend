<template>
    <router-link
        v-if="!openInNewTab"
        :to="localizedUrl"
        class="router-link"
    >
        <slot></slot>
    </router-link>

    <router-link
        v-else
        v-slot="{ href }"
        :to="localizedUrl"
        custom
    >
        <a
            :href="href"
            class="router-link"
            target="_blank"
            rel="noopener noreferrer"
        >
            <slot></slot>
        </a>
    </router-link>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

export default {
    components: { RouterLink },
    props: {
        to: {
            type: String,
            required: true,
        },
        openInNewTab: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const i18n = useI18n();

        const localizedUrl = computed(() => {
            const base = `/${i18n.locale.value}`
            return props.to === "/" ? base : `${base}/${props.to.replace(/^\/+/, '')}`
        });

        return {
            localizedUrl
        };
  },
}
</script>

<style scoped>
  .router-link {
    color: inherit;
    text-decoration: none;
  }
</style>
