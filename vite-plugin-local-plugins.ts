// Vite plugin. It runs in Node when Vite starts. It does not run in the
// browser, and it does not register frontend plugins. That happens later in
// src/plugin-system/registry.ts.
//
// Job of this file: read plugins.local.json and hand Vite a virtual module
// named "virtual:teslaris-plugins". That module contains real import()
// calls, which is the only form Vite can follow and bundle.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:teslaris-plugins";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

type LocalPluginsConfig = {
    plugins?: Record<string, string>;
    profiles?: Record<string, string[]>;
};

function loadConfig(root: string): LocalPluginsConfig {
    const configPath = resolve(root, "plugins.local.json");

    if (!existsSync(configPath)) {
        console.warn(
            "[plugins] plugins.local.json not found; running with core only. Copy plugins.local.example.json to plugins.local.json."
        );
        return { plugins: {}, profiles: {} };
    }

    return JSON.parse(readFileSync(configPath, "utf8")) as LocalPluginsConfig;
}

function resolvePluginEntry(root: string, spec: string): string {
    const pluginRoot = resolve(root, spec);
    const packagePath = resolve(pluginRoot, "package.json");

    if (existsSync(packagePath)) {
        const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
            exports?: { "."?: string | { import?: string; default?: string } };
            main?: string;
        };
        const entry = pkg.exports?.["."];
        const entryPath =
            typeof entry === "string"
                ? entry
                : (entry?.import ?? entry?.default ?? pkg.main ?? "src/index.ts");

        return resolve(pluginRoot, entryPath);
    }

    return resolve(pluginRoot, "src/index.ts");
}

export function localPlugins(): Plugin {
    let root = process.cwd();

    return {
        name: "teslaris-local-plugins",

        configResolved(config) {
            root = config.root;
        },

        configureServer(server) {
            const configPath = resolve(root, "plugins.local.json");
            server.watcher.add(configPath);
            server.watcher.on("change", (changed) => {
                if (resolve(changed) === configPath) {
                    void server.restart();
                }
            });
        },

        resolveId(id) {
            if (id === VIRTUAL_ID) {
                return RESOLVED_VIRTUAL_ID;
            }
        },

        load(id) {
            if (id !== RESOLVED_VIRTUAL_ID) {
                return;
            }

            const config = loadConfig(root);
            const plugins = config.plugins ?? {};

            const loaders = Object.entries(plugins).map(([pluginId, spec]) => {
                const entry = pathToFileURL(resolvePluginEntry(root, spec)).href;
                return `  ${JSON.stringify(pluginId)}: () => import(${JSON.stringify(entry)})`;
            });

            const profiles = {
                core: [] as string[],
                ...config.profiles,
            };

            return `export const pluginLoaders = {
${loaders.join(",\n")}
}

export const pluginProfiles = ${JSON.stringify(profiles, null, 2)}
`;
        },
    };
}
