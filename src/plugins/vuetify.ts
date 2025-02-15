// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { VTreeview } from 'vuetify/labs/VTreeview'
import { VFileUpload } from 'vuetify/labs/VFileUpload'

export default createVuetify({
    components: {
      VTreeview,
      VFileUpload
    },
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
