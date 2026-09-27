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

