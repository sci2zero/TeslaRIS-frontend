/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEFAULT_PUBLIC_CONFIG?: string;
}

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production';
        BASE_URL: string;
    }
}

interface ImportMetaEnv {
    readonly VITE_PLUGIN_PROFILE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "virtual:teslaris-plugins" {
    import type { FrontendPlugin } from "./src/plugin-system/types";

    export const pluginLoaders: Record<string, () => Promise<{ default: FrontendPlugin }>>;
    export const pluginProfiles: Record<string, readonly string[]>;
}
