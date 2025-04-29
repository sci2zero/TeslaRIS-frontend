<template>
    <!-- eslint-disable vue/no-v-html -->
    <div class="renderer" v-html="safeRenderedTitle"></div>
    <!-- eslint-enable vue/no-v-html -->
</template>
  
<script lang="ts">
import { defineComponent, computed, type PropType } from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";
import DOMPurify from "dompurify";


export default defineComponent({
    name: "RichTitleRenderer",
    props: {
        title: {
            type: Object as PropType<string | null>,
            required: true,
        },
    },
    setup(props) {
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

        const splitByLatexSections = (input: string): string[] => {
            const result: string[] = [];
            let buffer = "";
            let inLatex = false;

            for (let i = 0; i < input.length; i++) {
                const char = input[i];

                if (char === "$") {
                    if (!inLatex) {
                        if (buffer) result.push(buffer);
                        buffer = "$";
                        inLatex = true;
                    } else {
                        buffer += "$";
                        result.push(buffer);
                        buffer = "";
                        inLatex = false;
                    }
                } else {
                    buffer += char;
                }
            }

            if (buffer) {
                result.push(buffer);
            }

            return result;
        };
    
        const safeRenderedTitle = computed(() => {
            if (!props.title) {
                return "";
            }

            if (latexRegex.test(props.title)) {
                const parts = splitByLatexSections(props.title);

                const processedParts = parts.map((part) => {
                    if (!part) {
                        return "";
                    }

                    const isPartAnExpression = part.startsWith("$") && part.endsWith("$");
                    part = part.replaceAll("$", "");

                    if (isPartAnExpression) {
                        try {
                            const renderedMath = katex.renderToString(part.replace(/\$/g, ""), {
                                throwOnError: false,
                                displayMode: false,
                            });
                            return DOMPurify.sanitize(renderedMath);
                        } catch (error) {
                            return DOMPurify.sanitize(part);
                        }
                    } else {
                        return DOMPurify.sanitize(part);
                    }
                });

                return processedParts.join('');

            }
            return DOMPurify.sanitize(props.title);
        });
    
        return { safeRenderedTitle };
        },
    });
</script>

<style scoped>

.renderer {
    display: inline-block;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    width: 100%;
}

</style>
