<template>
    <div class="uri-input">
        <div class="uri-input__header">
            <div class="uri-input__label">
                {{ isWebsite ? $t("websiteLabel") : $t("uriInputLabel") }}
            </div>
            <button
                type="button"
                class="uri-input__add"
                @click="addUri"
            >
                <span class="mdi mdi-plus" />
                {{ $t("addUriLabel") }}
            </button>
        </div>
        <div
            v-for="(element, index) in uris"
            :key="index"
            class="uri-input__row"
        >
            <div class="uri-input__field">
                <ui-input
                    v-model="element.value"
                    :aria-label="isWebsite ? $t('websiteLabel') : $t('uriInputLabel')"
                    placeholder="URI"
                    :rules="uriValidationRules"
                    @update:model-value="sendContentToParent"
                />
            </div>
            <button
                v-if="canRemove"
                type="button"
                class="uri-input__remove"
                :title="$t('removeUriLabel')"
                :aria-label="$t('removeUriLabel')"
                @click="removeUri(index)"
            >
                <span class="mdi mdi-close" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, onMounted, ref } from 'vue';
import UiInput from '@/components/ui/input/Input.vue';

export default defineComponent({
    name: "UriInput",
    components: { UiInput },
    props: {
        modelValue: {
            type: Array<string>,
            required: true,
        },
        isWebsite: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const uris = ref([{value: ""}]);

        const canRemove = computed(() => uris.value.length > 1);

        onMounted(() => {
            populateUriList(props.modelValue);
        });

        const populateUriList = (uriList: string[]) => {
            uris.value = [];
            if (uriList && uriList.length > 0) {
                uris.value = [];
                uriList.forEach((uri) => {
                    if (!uri && uriList.length > 1) {
                        return;
                    }
                    uris.value.push({value: uri});
                });
            } else {
                uris.value.push({value: ""});
            }
            sendContentToParent();
        };

        const addUri = () => {
            uris.value.push({value: ""});
        };

        const removeUri = (index: number) => {
            if (uris.value.length <= 1) {
                return;
            }
            uris.value.splice(index, 1);
            if (uris.value.length === 0) {
                addUri();
            }
            sendContentToParent();
        };

        const sendContentToParent = () => {
            const arrayOfUris: string[] = [];
            uris.value.forEach(uri => {
                if (uri.value.trim() !== "") {
                    arrayOfUris.push(uri.value);
                }
            });
            emit("update:modelValue", arrayOfUris);
        };

        const clearInput = () => {
            refreshModelValue([""]);
        };

        const { uriValidationRules } = useValidationUtils();

        const refreshModelValue = (uriList: string[]) => {
            populateUriList(uriList);
        };

        const addUriToModel = (newUri: string) => {
            if (uris.value.every(item => item.value === "")) {
                uris.value.splice(0);
            }

            if (uris.value.every(item => item.value !== newUri)) {
                uris.value.push({value: newUri});
            }


            sendContentToParent();
        };

        return { 
            uris, addUri, removeUri, 
            sendContentToParent, clearInput,
            uriValidationRules, refreshModelValue,
            addUriToModel, canRemove
        };
    },
});
</script>

<style scoped>
.uri-input {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 100%;
}

.uri-input__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 1.25rem;
}

.uri-input__label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.2;
    color: #64748b;
    padding-left: 0.15rem;
}

.uri-input__row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.35rem;
    width: 100%;
}

.uri-input__field {
    flex: 1;
    min-width: 0;
}

.uri-input__remove {
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 9999px;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
}

.uri-input__remove:hover,
.uri-input__remove:focus-visible {
    background: #fee2e2;
    color: #b91c1c;
    outline: none;
}

.uri-input__add {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-left: auto;
    min-height: 0.5rem;
    padding: 0.1rem 0.45rem;
    border: 0;
    border-radius: 0.4rem;
    background: transparent;
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer;
}

.uri-input__add:hover,
.uri-input__add:focus-visible {
    background: #f8fafc;
    color: #64748b;
    outline: none;
}
</style>
