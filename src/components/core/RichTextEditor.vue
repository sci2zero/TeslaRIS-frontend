<template>
    <div class="container h-100">
        <bubble-menu
            v-if="editor"
            :editor="editor"
            :tippy-options="{ duration: 100 }"
        >
            <div class="bubble-menu">
                <button :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">
                    Bold
                </button>
                <button :class="{ 'is-active': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()">
                    Italic
                </button>
                <button :class="{ 'is-active': editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()">
                    Strike
                </button>
            </div>
        </bubble-menu>
        <editor-content style="height: 100%;" :editor="editor" />
    </div>
</template>

<script lang="ts">
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { computed, defineComponent, watch } from 'vue';
import Placeholder from '@tiptap/extension-placeholder'
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "RichTextEditor",
    components: { EditorContent, BubbleMenu },
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        editable: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update:modelValue", "input"],
    setup(props, { emit }) {
        const i18n = useI18n();
        const placeholder = computed(() => i18n.t("writeSomethingPlaceholder"));

        const editor = useEditor({
            content: props.modelValue,
            extensions: [
                StarterKit,
                Placeholder.configure({
                    placeholder: () => placeholder.value,
                })
            ],
            onUpdate: () => {
                emit('update:modelValue', editor.value.getHTML());
                emit("input");
            },
            editable: props.editable
        });

        watch(() => props.modelValue, () => {
            if (!props.editable) {
                editor.value.chain()
                    .setContent(props.modelValue)
                    .run()
            }
        });

        return { editor }
    },
});
</script>

<style>
.tiptap {
    height: 100%;
}
.bubble-menu {
    background-color: white;
    border: 1px solid rgba(61, 37, 20, .05);
    border-radius: 0.7rem;
    box-shadow: 0px 12px 33px 0px rgba(0, 0, 0, .06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, .04);
    display: flex;
    padding: 0.2rem;
    height: 100%;
}

.bubble-menu button {
    background-color: unset;
    padding: 3px 10px;
    border-radius: 5px;
}

.bubble-menu button:hover {
    background-color: rgba(61, 37, 20, .12);
}

.bubble-menu button.is-active {
    background-color: #6A00F5;
    color: white;
    font-weight: bold;
}

.bubble-menu button.is-active:hover {
    background-color: #5800CC;
}

.tiptap p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}

</style>
