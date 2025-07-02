<template>
    <v-card class="pa-2 text-left">
        <!-- eslint-disable vue/no-v-html -->
        <pre><code class="language-xml" v-html="formattedXML"></code></pre>
        <!-- eslint-enable vue/no-v-html -->
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Prism from "prismjs";
import "prismjs/themes/prism-dark.css";
import DOMPurify from "dompurify";


export default defineComponent({
  name: "CodeViewer",
  props: {
    codeContent: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: "XML"
    }
  },
  setup(props) {
    const formattedXML = ref("");

    const formatXML = (xml: string): string => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "application/xml");
            const xsltDoc = new DOMParser().parseFromString([
                '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
                '  <xsl:strip-space elements="*"/>',
                '  <xsl:template match="para[content-style][not(text())]">',
                '    <xsl:value-of select="normalize-space(.)"/>',
                '  </xsl:template>',
                '  <xsl:template match="node()|@*">',
                '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
                '  </xsl:template>',
                '  <xsl:output indent="yes"/>',
                '</xsl:stylesheet>',
            ].join('\n'), 'application/xml');

            const xsltProcessor = new XSLTProcessor();    
            xsltProcessor.importStylesheet(xsltDoc);
            const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
            const resultXml = new XMLSerializer().serializeToString(resultDoc);
            return resultXml;
        } catch (_error) {
            return "Invalid XML";
        }
    };

    watch(
        () => props.codeContent,
        (newVal) => {
            if (props.language === "XML") {
                const highlightedXML = Prism.highlight(formatXML(newVal), Prism.languages.xml, "xml");
                formattedXML.value = DOMPurify.sanitize(highlightedXML);
            }
        },
        { immediate: true }
    );

    return { 
        formattedXML 
    };
  },
});
</script>

<style scoped>

pre {
  background: #2d2d2d;
  color: white;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

</style>
