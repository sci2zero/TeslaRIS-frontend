<template>
    <router-link :to="localizedUrl">
        <slot></slot>
    </router-link>
</template>


<script lang="ts">
import { RouterLink } from 'vue-router'

export default {
  components: { RouterLink },
  props: {
    to: {
      type: String,
      required: true
    },
  },

  computed: {

    localizedUrl() {
      return this.to === "/"
        ? `/${this.$i18n.locale}`
        : `/${this.$i18n.locale}/${this.to}`
    },
  },
}
</script>
