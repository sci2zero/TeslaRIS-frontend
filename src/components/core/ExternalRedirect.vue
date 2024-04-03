<template>
    <div></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
    name: "ExternalRedirect",
    props: {
        url: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const { url } = props;

        onMounted(() => {
        window.location.href = url as string;
        });
    },
});
</script>