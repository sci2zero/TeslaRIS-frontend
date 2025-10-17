// Styles
import "@mdi/font/css/materialdesignicons.css";

// Vuetify
import { createVuetify } from "vuetify";
import { VTreeview } from 'vuetify/labs/VTreeview'
import { VFileUpload } from 'vuetify/labs/VFileUpload'


const teslarisLightTheme = {
    dark: false,
    colors: {
    //   background: 'var(--color-slate-100)',
      background: '#f3f4f6',
    //   surface: '#FF0000',
    },
    variables: {
      
    }
  }

export default createVuetify({
    components: {
        VTreeview,
        VFileUpload
    },
    theme: {
        defaultTheme: 'teslarisLightTheme',
        themes: {
            teslarisLightTheme
        }
    }
    // theme: {
    //     themes: {
    //         light: {
    //         dark: false,
    //         colors: {
    //             primary: "#E53935", // #E53935
    //             secondary: "#FFCDD2" // #FFCDD2
    //         }
    //         },
    //     },
    // },
});
