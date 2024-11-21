<template>
    <div class="container">
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
        <editor-content :editor="editor" />
    </div>
</template>

<script lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { defineComponent, watch } from 'vue';
import BubbleMenu from '@tiptap/extension-bubble-menu'
import Placeholder from '@tiptap/extension-placeholder'


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
    setup(props, {emit}) {
        const editor = useEditor({
            content: props.modelValue,
            extensions: [ 
                StarterKit,
                Placeholder.configure({
                    placeholder: 'Write something …',
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

<style lang="scss" scoped>

.bubble-menu {
  background-color: var(--white);
  border: 1px solid var(--gray-1);
  border-radius: 0.7rem;
  box-shadow: var(--shadow);
  display: flex;
  padding: 0.2rem;

  button {
    background-color: unset;

    &:hover {
      background-color: var(--gray-3);
    }

    &.is-active {
      background-color: var(--purple);

      &:hover {
        background-color: var(--purple-contrast);
      }
    }
  }
}

.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

</style>
