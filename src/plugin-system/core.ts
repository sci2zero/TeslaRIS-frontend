import type { FrontendPlugin } from "./types";

// The existing TeslaRIS application is the core. Country plugins merge on top
// of this contribution; they do not replace the host routes or screens.
export const corePlugin: FrontendPlugin = {
    id: "core",

    constants: {
        appName: "TeslaRIS",
    },
};
