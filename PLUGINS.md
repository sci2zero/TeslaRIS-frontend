# Plugins

TeslaRIS-frontend is the core app. Country-specific UI lives in separate packages and is loaded only for the profile you start.

`npm run dev` loads **core**. `npm run dev:portugal` also loads the Portugal package.

## How a profile is chosen

1. Copy `plugins.local.example.json` to `plugins.local.json` (gitignored). It maps a plugin id to a folder, and a profile name to the plugins it loads.

```json
{
  "plugins": { "portugal": "../teslaris-portugal" },
  "profiles": { "portugal": ["portugal"] }
}
```

2. `VITE_PLUGIN_PROFILE` selects the profile. `.env` sets `core`. `.env.portugal` sets `portugal`, and `npm run dev:portugal` uses that file.

Core is always registered first. An unknown profile falls back to core.

Changing `plugins.local.json` restarts the dev server. There is no install step: Vite imports each package's `src/index.ts` directly.

## What a plugin can add

A plugin is a default export from `src/index.ts`:

| Field | Effect |
| --- | --- |
| `overrides` | Replace a named core component. Same name, last plugin wins. |
| `extensions` | Add items to a named slot. Same `id` replaces the previous item. `order` sorts them. |
| `routes` | Add a route. Same route name replaces the previous one. |
| `i18n` | Merge translation messages into the existing locales. |
| `config`, `constants` | Deep-merge plain objects. Later plugins overwrite the same keys. `config.defaultLocale` and `config.supportedLocales` replace the core language defaults. Supported values are `sr`, `sr-cyr`, and `en`. |

The host reads these through `src/plugin-system/`:

- `<PluginOverride name="...">` renders a replacement component, or its fallback.
- `<PluginExtensions name="...">` renders every contribution for that slot.
- `getExtensions("home.cards")` is the data form of the same idea. The home page uses it for cards that are not full components.

## Example

`teslaris-portugal` contributes two home cards. Core keeps researchers, units, results, and projects. Portugal inserts activities (`order: 40`) and funding (`order: 60`) between them.

```ts
export default {
    id: "teslaris-portugal",
    extensions: {
        "home.cards": [
            { id: "activities", titleKey: "activitiesLabel", order: 40, data: { icon: "mdi-calendar-star" } },
            { id: "fundings", titleKey: "fundingsLabel", order: 60, data: { icon: "mdi-cash-multiple" } },
        ],
    },
};
```

`titleKey` is an existing i18n key in the core app. The card `data` is read by `HomeView.vue`.

The same package also contributes `HomeDataQuality.vue` on the `home.dataQuality` slot, rendered in the light band under the hero. Core has no fallback there, so the panel is absent unless Portugal is loaded.

Cited researchers, institutions, and publications live in `TopCitedFeatures.vue`. The home page shows that component unless a plugin overrides `home.topCited`. Portugal overrides it with an empty component, so those lists appear only in the base profile.
