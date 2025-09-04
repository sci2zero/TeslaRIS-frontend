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
        
        <div class="content-container" :class="editable ? 'bordered' : ''">
            <!-- eslint-disable vue/no-v-html -->
            <div
                v-show="isTruncated"
                class="truncated-content"
                v-html="truncatedHtml">
            </div>
            <!-- eslint-enable vue/no-v-html -->
            <editor-content
                v-if="!isTruncated"
                style="height: 100%;"
                :editor="editor"
            />
            
            <v-btn 
                v-if="limitDisplay > 0 && modelValue && modelValue.length > limitDisplay"
                color="primary" 
                variant="text" 
                size="small" 
                class="link-style-btn ml-2"
                @click="expandContent"
            >
                {{ readMoreText }}
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { computed, defineComponent, ref, watch } from 'vue';
import Placeholder from '@tiptap/extension-placeholder'
import { useI18n } from 'vue-i18n';
import lodash from "lodash";
import DOMPurify from "dompurify";


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
        },
        limitDisplay: {
            type: Number,
            default: 0
        }
    },
    emits: ["update:modelValue", "input"],
    setup(props, { emit }) {
        const i18n = useI18n();
        const placeholder = computed(() => i18n.t("writeSomethingPlaceholder"));
        const isExpanded = ref(false);
        const truncatedHtml = ref("");
        const lastKeyCode = ref("");

        document.addEventListener('keypress', function (e){
            const nowKeyCode = e.key;
            lastKeyCode.value = nowKeyCode;
        });

        const isTruncated = computed(() => {
            return props.limitDisplay > 0 && !isExpanded.value && props.modelValue && props.modelValue.length > props.limitDisplay;
        });

        const readMoreText = computed(() => {
            return i18n.t(isExpanded.value ? i18n.t("readLessLabel") : i18n.t("readMoreLabel"));
        });

        const truncateHtml = (html: string, limit: number): string => {
            if (!html || limit <= 0) return html;

            html = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const plainText = tempDiv.textContent || '';
            if (plainText.length <= limit) return html;

            let currentLength = 0;
            let truncatedNode: Node | null = null;
            let offset = 0;

            const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
            let node: Node | null = walker.nextNode();

            while (node) {
                const textContent = node.textContent || '';
                if (currentLength + textContent.length > limit) {
                    truncatedNode = node;
                    offset = limit - currentLength;
                    break;
                }
                currentLength += textContent.length;
                node = walker.nextNode();
            }

            if (truncatedNode) {
                const range = document.createRange();
                range.setStart(tempDiv, 0);
                range.setEnd(truncatedNode, offset);

                const extracted = range.extractContents();

                let lastTextNode: Node | null = null;
                const walker2 = document.createTreeWalker(extracted, NodeFilter.SHOW_TEXT);
                let n2: Node | null = walker2.nextNode();
                while (n2) {
                    lastTextNode = n2;
                    n2 = walker2.nextNode();
                }

                if (lastTextNode && lastTextNode.nodeType === Node.TEXT_NODE) {
                    lastTextNode.textContent = (lastTextNode.textContent || '') + '...';
                } else {
                    extracted.appendChild(document.createTextNode('...'));
                }

                const container = document.createElement('div');
                container.appendChild(extracted);
                return container.innerHTML;
            }

            return tempDiv.innerHTML;
        };

        watch(() => props.modelValue, (newVal) => {
            if (props.limitDisplay > 0 && newVal && newVal.length > props.limitDisplay) {
                truncatedHtml.value = truncateHtml(newVal, props.limitDisplay);
            } else {
                truncatedHtml.value = newVal;
            }
        }, { immediate: true });

        const editor = useEditor({
            content: props.modelValue,
            extensions: [
                StarterKit,
                Placeholder.configure({
                    placeholder: () => placeholder.value,
                })
            ],
            editable: props.editable
        });

        watch(
            () => editor.value?.getHTML(),
            lodash.debounce((newVal) => {
                const editorInstance = editor.value;
                if (!editorInstance) return;

                if (lastKeyCode.value === " ") return;

                if (!props.editable) {
                    editorInstance.commands.setContent(newVal);
                } else {
                    const { state } = editorInstance;
                    const { from, to } = state.selection;

                    editorInstance.commands.setContent(newVal);
                    editorInstance.commands.setTextSelection({ from, to });
                }

                emit('update:modelValue', newVal);
                emit("input");
            }, 500)
        );

        watch(() => props.modelValue, () => {
            if (!props.editable) {
                editor.value?.chain().setContent(props.modelValue).run();
            } else {
                const editorInstance = editor.value;
                if (!editorInstance) return;

                const { state } = editorInstance;
                const { from, to } = state.selection;

                editorInstance.chain()
                    .setContent(props.modelValue)
                    .run();

                editorInstance.chain()
                    .setTextSelection({ from, to })
                    .run();
            }
        });

        const expandContent = () => {
            isExpanded.value = !isExpanded.value;
        };

        return { 
            editor, 
            isTruncated, 
            truncatedHtml, 
            readMoreText, 
            expandContent 
        }
    },
});
</script>

<style>
.tiptap {
    height: 100%;
    padding: 10px;
    --white: #FFF;
    --black: #2E2B29;
    --black-contrast: #110F0E;
    --gray-1: rgba(61, 37, 20, .05);
    --gray-2: rgba(61, 37, 20, .08);
    --gray-3: rgba(61, 37, 20, .12);
    --gray-4: rgba(53, 38, 28, .3);
    --gray-5: rgba(28, 25, 23, .6);
    --green: #22C55E;
    --purple: #6A00F5;
    --purple-contrast: #5800CC;
    --purple-light: rgba(88, 5, 255, .05);
    --yellow-contrast: #FACC15;
    --yellow: rgba(250, 204, 21, .4);
    --yellow-light: #FFFAE5;
    --red: #FF5C33;
    --red-light: #FFEBE5;
    --shadow: 0px 12px 33px 0px rgba(0, 0, 0, .06), 0px 3.618px 9.949px 0px rgba(0, 0, 0, .04);
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

.tiptap :first-child {
	margin-top: 0;
}

.tiptap ul, .tiptap ol {
	padding: 0 1rem;
	margin: 1.25rem 1rem 1.25rem 0.4rem;
}

.tiptap ul li p, .tiptap ol li p {
	margin-top: 0.25em;
	margin-bottom: 0.25em;
}

.tiptap h1, .tiptap h2, .tiptap h3, .tiptap h4, .tiptap h5, .tiptap h6 {
	line-height: 1.1;
	margin-top: 2.5rem;
	text-wrap: pretty;
}

.tiptap h1, .tiptap h2 {
	margin-top: 3.5rem;
	margin-bottom: 1.5rem;
}

.tiptap h1 {
	font-size: 1.4rem;
}

.tiptap h2 {
	font-size: 1.2rem;
}

.tiptap h3 {
	font-size: 1.1rem;
}

.tiptap h4, .tiptap h5, .tiptap h6 {
	font-size: 1rem;
}

.tiptap code {
	background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
}

.tiptap pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;
}

.tiptap pre code {
    background: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0;
}

.tiptap blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
}

.tiptap hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
}

.bordered {
    outline: 1px solid #110F0E;
    background-color: #fafafa !important;
    color: #000000 !important;
}

.truncated-content {
    position: relative;
    height: 100%;
    padding: 10px;
    overflow: hidden;
}

.read-more-btn {
    background-color: #6A00F5;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    font-weight: bold;
}

.read-more-btn:hover {
    background-color: #5800CC;
}

.truncated-content .tiptap {
    all: unset;
}

.truncated-content p,
.truncated-content ul,
.truncated-content ol,
.truncated-content h1,
.truncated-content h2,
.truncated-content h3,
.truncated-content h4,
.truncated-content h5,
.truncated-content h6 {
    margin: 0.5rem 0;
}

.truncated-content ul,
.truncated-content ol {
    padding-left: 1.5rem;
}

.link-style-btn {
    text-transform: none;
    text-decoration: underline;
    font-weight: normal;
    padding: 0;
    min-width: auto;
    height: auto;
    margin-top: -20px;
}

.link-style-btn:hover {
    background-color: transparent !important;
    text-decoration: underline;
}

</style>