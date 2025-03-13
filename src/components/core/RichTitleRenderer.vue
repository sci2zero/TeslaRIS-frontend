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
    
        const safeRenderedTitle = computed(() => {
            if (!props.title) {
                return "";
            }

            console.log(props.title)
            if (latexRegex.test(props.title)) {
                const parts = props.title.split("$")
                const processedParts = parts.map((part, index) => {
                    if (!part) {
                        return "";
                    }

                    const isPartAnExpression = latexRegex.test(`$${part}$`);

                    if (index > 0 && index < parts.length - 1 && isPartAnExpression) {
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
    width: 100%;
}

</style>
