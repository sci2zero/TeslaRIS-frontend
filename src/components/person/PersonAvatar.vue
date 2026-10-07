<template>
    <v-avatar :size="size" class="person-avatar">
        <img
            v-if="hasPhoto && !imageFailed"
            :src="photoUrl"
            class="person-avatar-image"
            alt=""
            @error="imageFailed = true"
        >
        <span
            v-else-if="initials"
            class="person-avatar-initials">
            {{ initials }}
        </span>
        <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="2 2 20 20"
            class="person-avatar-placeholder"
        >
            <path
                fill="currentColor"
                d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
            />
        </svg>
    </v-avatar>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, type PropType } from "vue";

export default defineComponent({
    name: "PersonAvatar",
    props: {
        personId: {
            type: Number as PropType<number | undefined>,
            default: undefined
        },
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        name: {
            type: String,
            default: ""
        },
        size: {
            type: [Number, String],
            default: 40
        }
    },
    setup(props) {
        const baseServerUrl = import.meta.env.VITE_BASE_URL as string;
        const imageFailed = ref(false);

        const hasPhoto = computed(() => !!props.personId && props.personId > 0);

        const photoUrl = computed(() =>
            hasPhoto.value ? `${baseServerUrl}file/raw-image/${props.personId}` : ""
        );

        const initials = computed(() => {
            const first = props.firstName?.charAt(0) || "";
            const last = props.lastName?.charAt(0) || "";
            if (first || last) {
                return (first + last).toUpperCase();
            }

            const tokens = props.name
                .replace(/\([^)]*\)/g, " ")
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            if (tokens.length === 0) {
                return "";
            }
            if (tokens.length === 1) {
                return tokens[0].charAt(0).toUpperCase();
            }

            return (tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)).toUpperCase();
        });

        watch(() => props.personId, () => {
            imageFailed.value = false;
        });

        return {
            hasPhoto,
            photoUrl,
            initials,
            imageFailed
        };
    }
});
</script>

<style scoped>
.person-avatar {
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    color: #4338ca;
}

.person-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.person-avatar-initials {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4338ca;
}

.person-avatar-placeholder {
    width: 70%;
    height: 70%;
}
</style>
