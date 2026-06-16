# Quick Start | Prisma Zod Generator

## 1\. Install[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#1-install "Direct link to 1. Install")

### Requirements[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#requirements "Direct link to Requirements")

| Component | Minimum | Recommended |
| --- | --- | --- |
| Node.js | 20.19.0 | 22.x |
| Prisma | 7.0.0 | Latest 7.x |
| Zod | 4.0.5 | Latest 4.x |
| TypeScript | 5.4.0 | 5.9.x |

-   npm

-   yarn
-   pnpm

```
npm install prisma-zod-generator zod @prisma/client
```

## 2\. Add generator to `schema.prisma`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#2-add-generator-to-schemaprisma "Direct link to 2-add-generator-to-schemaprisma")

```
generator client {  provider = "prisma-client"}generator zod {  provider = "prisma-zod-generator"  // optional output = "./prisma/generated" (JSON config can supply if omitted)  // optional config = "./zod-generator.config.json" (relative to schema file)}
```

Config Path Resolution

Config file paths (e.g., `config = "./my-config.json"`) are resolved **relative to the Prisma schema file location**, not the project root. If your schema is at `prisma/schema.prisma`, then `config = "./my-config.json"` will look for the config file at `prisma/my-config.json`.

## 3\. (Optional) Create configuration file[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#3-optional-create-configuration-file "Direct link to 3. (Optional) Create configuration file")

Create `prisma/zod-generator.config.json` (next to your schema file).

### Minimal pure schema output for TanStack Start

For best performance in a TanStack Start app, generate only lean pure model schemas and skip heavy input/result variants unless you need them. This keeps generated code small, improves TypeScript compile speed, and reduces Vite/HMR overhead.

Recommended configuration:

```
{
  "mode": "minimal",
  "pureModels": true,
  "globalExclusions": {
    "input": ["id", "createdAt", "updatedAt"],
    "pure": ["password", "hashedPassword"],
    "result": []
  },
  "variants": {
    "pure": {
      "enabled": true,
      "suffix": ".model"
    },
    "input": {
      "enabled": false
    },
    "result": {
      "enabled": false
    }
  }
}
```

Key benefits:

- `mode: "minimal"` disables select/include and prunes deep nested inputs.
- `pureModels: true` generates only the compact model schemas you need for typed validation.
- `variants.pure.enabled: true` keeps pure outputs while skipping extra CRUD, input, and result schemas.
- `suffix: ".model"` gives a stable file/export naming pattern for imports.

If you need a single bundle instead of multiple files, set `useMultipleFiles: false`, but for editor and incremental rebuild performance the default multi-file layout is usually better.

## 4\. Generate[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#4-generate "Direct link to 4. Generate")

```
npx prisma generate
```

## 5\. Consume[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#5-consume "Direct link to 5. Consume")

```
import { UserModelSchema } from './prisma/generated/models';
UserModelSchema.parse(data);
```

Use the generated pure model schema imports when you are using minimal pure schema output. If you later need input or result objects, enable those variants explicitly.

## Directory Layout (multi-file default)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#directory-layout-multi-file-default "Direct link to Directory Layout (multi-file default)")

```
prisma/generated/  schemas/    enums/    objects/    variants/    index.ts  models/
```

Single-file mode collapses to `schemas.ts` via config (`useMultipleFiles:false`).

## Next Steps[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start#next-steps "Direct link to Next Steps")

Explore PZG Pro feature packs (SDK, Forms, API Docs, RLS, Multi‑tenant, Performance, Factories, Guard, Contracts, Server Actions): [Pro Features](https://omar-dulaimi.github.io/prisma-zod-generator/docs/features/overview).

---
Source: [Quick Start | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/quick-start)
# Core Concepts | Prisma Zod Generator

**Variants**: Parallel schema sets expressing different contexts.

| Variant | Intent | Typical Fields |
| --- | --- | --- |
| pure | Canonical model snapshot (optionally lean) | All / minus excluded |
| input | Data accepted for create/update ops | Often omits id, timestamps |
| result | Data returned to callers | Usually full model |

You can also define **array-based custom variants** with suffix, exclusions, and optional field transforms.

**Modes**:

-   `full` – everything enabled by default.

-   `minimal` – lean subset: restricts operations, disables select/include, prunes complex nested inputs.
-   `custom` – you explicitly enable/disable.

**Filtering Layers** (highest precedence first):

1.  `model.fields.include`
2.  model variant excludes (`models[Model].variants.variant.excludeFields`)
3.  legacy `model.fields.exclude`
4.  global variant excludes (`globalExclusions.variant`)
5.  global array excludes (legacy array form)

**Emission Controls**: `emit.enums`, `emit.objects`, `emit.crud`, `emit.pureModels`, `emit.variants`, `emit.results`—each can short‑circuit generation to reduce output.

**Heuristics**:

-   `pureModelsOnlyMode`: pureModels + all variants disabled (custom mode) ⇒ only pure models emitted.

-   `pureVariantOnlyMode`: pureModels + only pure variant enabled ⇒ skip CRUD/input/result scaffolding.

**Circular Dependency Resolution**: When `pureModelsIncludeRelations` is enabled, `pureModelsExcludeCircularRelations` can intelligently exclude problematic bidirectional relations to avoid TypeScript circular dependency errors while preserving foreign keys.

**Strict Mode Configuration**: Fine-grained control over when `.strict()` is applied to generated Zod schemas:

-   **Global Control**: Configure strict mode for all schemas or specific schema types (operations, objects, variants)

-   **Model-Level Overrides**: Set different strict mode behavior for specific models
-   **Operation-Specific**: Control strict mode for individual operations (findMany, create, update, etc.)

-   **Variant-Level**: Configure strict mode independently for pure, input, and result variants
-   **Enum Handling**: Enums are inherently strict and don't support `.strict()` method

-   **Backward Compatible**: Defaults to strict mode enabled everywhere for existing projects

See the [strict mode configuration page](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/strict-mode) for complete documentation and common patterns.

**Naming Customization** drives file & export shapes across all schema types:

-   **Pure Models**: `naming.preset` + `naming.pureModel` overrides

-   **CRUD Schemas**: `naming.schema` for operation file/export patterns (requires `{operation}` token to avoid collisions)
-   **Input Objects**: `naming.input` for input type file/export patterns

-   **Enums**: `naming.enum` for enum file/export patterns

See the [naming configuration page](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/naming) for complete documentation.

---
Source: [Core Concepts | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/intro/concepts)
# Configuration Precedence | Prisma Zod Generator

Final config is assembled in stages:

1.  Generator block options (Prisma `schema.prisma`) – highest priority.
2.  JSON config file (explicit `config` path or auto-discovered: `zod-generator.config.json`, `prisma/config.json`, `config.json`).
3.  Internal defaults (`processConfiguration`).

## Config File Path Resolution[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/precedence#config-file-path-resolution "Direct link to Config File Path Resolution")

Config file paths are resolved **relative to the Prisma schema file directory**, not the project root:

prisma/schema.prisma

```
generator zod {  provider = "prisma-zod-generator"  config   = "./my-config.json"  // → prisma/my-config.json}
```

apps/api/schema.prisma

```
generator zod {  provider = "prisma-zod-generator"  config   = "../../shared/zod.config.json"  // → shared/zod.config.json}
```

This allows flexible config placement in monorepos and projects with custom schema locations.

## Output Path Resolution[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/precedence#output-path-resolution "Direct link to Output Path Resolution")

Output path resolution is deferred until after merging so a JSON `output` applies when the generator block omits `output`. Like config paths, output paths are also resolved relative to the schema file location.

Conflict warnings are logged (file layout options) via `warnOnFileLayoutConflicts`—generator block wins.

Legacy flags (e.g. `isGenerateSelect`, `isGenerateInclude`) are folded into the unified config; minimal mode forcibly disables select/include even if legacy flags true.

---
Source: [Configuration Precedence | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/precedence)
# Generation Modes | Prisma Zod Generator

| Mode | Models default | Variants default | Operations | Notes |
| --- | --- | --- | --- | --- |
| full | all enabled | all enabled | all Prisma ops | Richest output |
| minimal | disabled unless explicitly configured | input & pure enabled (result often off) | Restricted core CRUD + find | Prunes complex nested inputs, disables select/include |
| custom | all enabled unless disabled | respect `variants.*.enabled` | all unless filtered | Explicit control |

Minimal mode specifics:

-   Forces `select/include` disabled even if flags set.

-   Applies `MINIMAL_OPERATIONS` (or `minimalOperations` override) for unspecified models.
-   Skips many heavy nested input object schemas (allow-list basics).

-   **Create operations use `UncheckedCreateInput` only**: Blocks regular `*CreateInput` schemas that require complex nested relations, favoring simple foreign key-based `*UncheckedCreateInput` schemas.
-   **Update operations support both variants**: Allows both `*UpdateInput` and `*UncheckedUpdateInput` for flexibility.

## Emission Heuristics[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/modes#emission-heuristics "Direct link to Emission Heuristics")

| Condition | Effect |
| --- | --- |
| `pureModels=true` AND all `variants.*.enabled=false` AND `mode=custom` | Pure-models-only (emit only pure model schemas) |
| `pureModels=true` AND only `variants.pure.enabled=true` | Pure-variant-only (skip CRUD/input/result schemas) |
| `emit.results=false` | Internally sets `variants.result.enabled=false` before generation |
| `useMultipleFiles=false` | Single-file bundle; directory cleanup after flush |
| `mode=minimal` | Suppresses select/include + prunes deep input objects |

Explicit `emit.*` booleans, when provided, override heuristics for that category (except minimal’s enforced suppressions).

---
Source: [Generation Modes | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/modes)
# Variants System | Prisma Zod Generator

Two forms:

1.  Object-based (`variants.pure/input/result`) – enable flags + suffix + excludeFields + partial.
2.  Array-based custom variants – each element: `{ name, suffix?, exclude?, additionalValidation?, makeOptional?, transformRequiredToOptional?, transformOptionalToRequired?, removeValidation?, partial? }`.

Generation behavior:

-   Skips entirely if `emit.variants=false` or single-file mode active (variants suppressed in strict single-file).

-   Pure models may still generate separately (`emit.pureModels`).
-   `pureVariantOnlyMode` & `pureModelsOnlyMode` heuristics reduce other schema categories.

Custom variant field building applies:

-   Base inferred zod type

-   Optionality transforms
-   Additional validations from variant def or `@zod` doc comments

-   Enum imports resolved relative to variants directory

## Partial Flag[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#partial-flag "Direct link to Partial Flag")

The `partial` flag automatically applies `.partial()` to generated Zod schemas, making all fields optional. This is useful for update operations where you only want to provide some fields.

### Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration "Direct link to Configuration")

Object-based variants:

```
{  "variants": {    "input": {      "enabled": true,      "partial": true    },    "result": {      "enabled": true,      "partial": false    }  }}
```

Array-based custom variants:

```
{  "variants": [    {      "name": "UpdateInput",      "suffix": "UpdateInput",      "partial": true    },    {      "name": "CreateInput",      "suffix": "CreateInput",      "partial": false    }  ]}
```

### Example Output[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#example-output "Direct link to Example Output")

With `partial: true`:

```
export const UserInputSchema = z.object({  id: z.number().int(),  name: z.string(),  email: z.string().email()}).strict().partial();
```

With `partial: false` (default):

```
export const UserResultSchema = z.object({  id: z.number().int(),  name: z.string(),  email: z.string().email()}).strict();
```

### Use Cases[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#use-cases "Direct link to Use Cases")

-   **Update operations**: Use `partial: true` for PATCH/PUT endpoints where users provide only fields to update

-   **Create operations**: Use `partial: false` for POST endpoints where all required fields must be provided
-   **Form handling**: Partial schemas for progressive form completion

-   **API flexibility**: Allow clients to send minimal payloads

---
Source: [Variants System | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants)
# Strict Mode Configuration | Prisma Zod Generator

The strict mode feature provides granular control over when `.strict()` is applied to generated Zod schemas. By default, all schemas include `.strict()` for backward compatibility, but you can now configure this behavior globally, per-model, per-operation, or per-variant.

## Overview[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overview "Direct link to Overview")

Zod's `.strict()` method prevents unknown properties from being accepted during validation. While this provides type safety, there are scenarios where you might want more flexible validation:

-   **API integration**: External APIs might return additional fields

-   **Gradual migration**: Transitioning from loose to strict validation
-   **Development flexibility**: Allowing extra fields during development

## Global Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#global-configuration "Direct link to Global Configuration")

Configure strict mode globally for all schemas:

```
{  "strictMode": {    "enabled": true,        // Global default for all schemas    "operations": true,     // CRUD operation schemas (findMany, create, etc.)    "objects": true,        // Input object schemas (WhereInput, CreateInput, etc.)    "variants": true        // Variant schemas (pure, input, result)  }}
```

### Default Behavior[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#default-behavior "Direct link to Default Behavior")

Without any `strictMode` configuration, all schemas include `.strict()` for backward compatibility:

```
// Default behaviorexport const UserCreateInputSchema = z.object({  name: z.string(),  email: z.string()}).strict(); // ← Applied by default
```

### Disabling Globally[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#disabling-globally "Direct link to Disabling Globally")

To disable strict mode for all schemas:

```
{  "strictMode": {    "enabled": false  }}
```

```
// Result: no .strict() suffixexport const UserCreateInputSchema = z.object({  name: z.string(),  email: z.string()}); // ← No .strict()
```

## Schema Type Control[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schema-type-control "Direct link to Schema Type Control")

Control strict mode for specific schema types:

```
{  "strictMode": {    "enabled": true,    "operations": true,    // findMany, create, update operations    "objects": false,      // WhereInput, CreateInput objects    "variants": true       // Pure, input, result variants  }}
```

This configuration results in:

```
// Operations: strict (operations: true)export const FindManyUserArgsSchema = z.object({  where: UserWhereInputSchema.optional()}).strict(); // ← Has .strict()// Objects: not strict (objects: false)export const UserWhereInputSchema = z.object({  name: z.string().optional()}); // ← No .strict()// Variants: strict (variants: true)export const UserPureSchema = z.object({  id: z.number(),  name: z.string()}).strict(); // ← Has .strict()// Enums: always strict (inherently strict, no .strict() method)export const StatusSchema = z.enum(['ACTIVE', 'INACTIVE']); // ← No .strict() needed
```

## Model-Level Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#model-level-configuration "Direct link to Model-Level Configuration")

Override strict mode settings for specific models:

```
{  "strictMode": {    "enabled": true,    "operations": false,    "objects": false  },  "models": {    "User": {      "strictMode": {        "enabled": true,      // Enable for User model        "operations": true,   // Override: User operations get .strict()        "objects": true      // Override: User objects get .strict()      }    },    "Post": {      "strictMode": {        "enabled": false     // Disable all strict mode for Post      }    }  }}
```

Result:

-   **User**: All schemas get `.strict()` (model override)

-   **Post**: No schemas get `.strict()` (model disabled)
-   **Other models**: Follow global settings (operations and objects disabled)

## Operation-Level Control[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#operation-level-control "Direct link to Operation-Level Control")

Control strict mode for specific operations within a model:

```
{  "models": {    "User": {      "strictMode": {        "operations": ["findMany", "create"],  // Only these operations get .strict()        "exclude": ["update"]                  // Exclude update operations      }    }  }}
```

```
// Gets .strict() (in operations list)export const FindManyUserArgsSchema = z.object({...}).strict();// Gets .strict() (in operations list)export const CreateOneUserArgsSchema = z.object({...}).strict();// No .strict() (not in operations list)export const UpdateOneUserArgsSchema = z.object({...});// No .strict() (in exclude list)export const UpdateManyUserArgsSchema = z.object({...});
```

### Operation Names[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#operation-names "Direct link to Operation Names")

Valid operation names include:

-   `findUnique`, `findUniqueOrThrow`

-   `findFirst`, `findFirstOrThrow`
-   `findMany`

-   `create`, `createMany`, `createManyAndReturn`
-   `update`, `updateMany`, `updateManyAndReturn`

-   `delete`, `deleteMany`
-   `upsert`

-   `aggregate`, `groupBy`, `count`

## Variant-Level Control[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#variant-level-control "Direct link to Variant-Level Control")

Configure strict mode for specific variants:

### Global Variant Settings[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#global-variant-settings "Direct link to Global Variant Settings")

```
{  "strictMode": {    "variants": false  // Disable for all variants globally  },  "variants": {    "pure": {      "enabled": true,      "strictMode": true    // Override: pure variants get .strict()    },    "input": {      "enabled": true,      "strictMode": false   // Explicit: input variants don't get .strict()    },    "result": {      "enabled": true      // Uses global variants setting (false)    }  }}
```

### Model-Specific Variant Settings[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#model-specific-variant-settings "Direct link to Model-Specific Variant Settings")

```
{  "models": {    "User": {      "strictMode": {        "variants": {          "pure": true,     // User pure variant gets .strict()          "input": false,   // User input variant doesn't get .strict()          "result": null    // Uses global/parent setting        }      }    }  }}
```

## Configuration Hierarchy[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration-hierarchy "Direct link to Configuration Hierarchy")

Strict mode settings follow a hierarchy (most specific wins):

1.  **Operation-level** (`models.ModelName.strictMode.operations` array)
2.  **Model-level** (`models.ModelName.strictMode.*`)
3.  **Global schema type** (`strictMode.operations`, `strictMode.objects`, etc.)
4.  **Global default** (`strictMode.enabled`)

### Example Hierarchy[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#example-hierarchy "Direct link to Example Hierarchy")

```
{  "strictMode": {    "enabled": false,      // 4. Global default: disabled    "operations": true     // 3. Global operations: enabled  },  "models": {    "User": {      "strictMode": {        "enabled": true,         // 2. Model-level: enabled        "operations": ["findMany"] // 1. Operation-level: only findMany      }    }  }}
```

Result for User model:

-   `findMany`: **strict** (operation-level wins)

-   `create`: **not strict** (not in operation list)
-   `objects`: **strict** (inherits from model-level enabled)

## Common Patterns[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#common-patterns "Direct link to Common Patterns")

### API-Friendly Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#api-friendly-configuration "Direct link to API-Friendly Configuration")

Disable strict mode for operations but keep it for internal schemas:

```
{  "strictMode": {    "enabled": true,    "operations": false,  // Allow extra fields in API requests    "objects": true,      // Keep strict for internal validation    "variants": true  }}
```

### Development vs Production[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#development-vs-production "Direct link to Development vs Production")

Development configuration (more permissive):

```
{  "strictMode": {    "enabled": false,    "operations": false,    "objects": false,    "variants": true     // Keep variants strict for type safety  }}
```

Production configuration (strict validation):

```
{  "strictMode": {    "enabled": true,    "operations": true,    "objects": true,    "variants": true  }}
```

### Gradual Migration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#gradual-migration "Direct link to Gradual Migration")

Start with loose validation and gradually enable strict mode:

```
{  "strictMode": {    "enabled": false  // Start permissive  },  "models": {    "User": {      "strictMode": {        "enabled": true  // Migrate User model first      }    }  }}
```

## Backward Compatibility[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#backward-compatibility "Direct link to Backward Compatibility")

The strict mode feature maintains full backward compatibility:

-   **No configuration**: All schemas get `.strict()` (existing behavior)

-   **Existing projects**: Continue working without changes
-   **New projects**: Can opt into flexible validation

## Examples[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#examples "Direct link to Examples")

### Basic Usage[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#basic-usage "Direct link to Basic Usage")

Disable strict mode for all operations but keep it for objects:

```
{  "strictMode": {    "enabled": true,    "operations": false,    "objects": true  }}
```

### Advanced Model Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#advanced-model-configuration "Direct link to Advanced Model Configuration")

Different strict mode settings per model:

```
{  "strictMode": {    "enabled": false,    "operations": false,    "objects": false  },  "models": {    "User": {      "strictMode": {        "enabled": true,        "operations": ["findMany", "create"],        "objects": true,        "variants": {          "pure": true,          "input": false        }      }    },    "Post": {      "strictMode": {        "operations": true,        "exclude": ["update", "delete"]      }    }  }}
```

### Variant-Specific Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#variant-specific-configuration "Direct link to Variant-Specific Configuration")

```
{  "strictMode": {    "enabled": true,    "variants": false  },  "variants": {    "pure": {      "enabled": true,      "strictMode": true    },    "input": {      "enabled": true,      "strictMode": false    }  },  "models": {    "User": {      "strictMode": {        "variants": {          "result": true        }      }    }  }}
```

## Migration Guide[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#migration-guide "Direct link to Migration Guide")

### From Always Strict (Default)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#from-always-strict-default "Direct link to From Always Strict (Default)")

If you're upgrading and want to maintain existing behavior, no changes are needed. All schemas will continue to include `.strict()`.

### To Flexible Validation[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#to-flexible-validation "Direct link to To Flexible Validation")

To allow extra fields in API requests:

```
{  "strictMode": {    "operations": false,  // Allow extra fields in operation inputs    "objects": true       // Keep strict for internal objects  }}
```

### Per-Model Migration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#per-model-migration "Direct link to Per-Model Migration")

Migrate models gradually:

```
{  "strictMode": {    "enabled": true  // Keep existing strict behavior  },  "models": {    "NewModel": {      "strictMode": {        "operations": false  // New model allows extra fields      }    }  }}
```

## Best Practices[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#best-practices "Direct link to Best Practices")

1.  **Start Conservative**: Begin with strict mode enabled and selectively disable where needed
2.  **Test Thoroughly**: Validate that your application handles extra fields correctly when strict mode is disabled
3.  **Document Decisions**: Comment your configuration to explain why certain models/operations have different strict mode settings
4.  **Environment-Specific**: Consider different configurations for development vs production
5.  **Gradual Migration**: When changing existing projects, migrate model by model rather than all at once

## Troubleshooting[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#troubleshooting "Direct link to Troubleshooting")

### Schemas Still Have .strict()[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schemas-still-have-strict "Direct link to Schemas Still Have .strict()")

Check the configuration hierarchy. More specific settings override general ones:

```
{  "strictMode": {    "enabled": false  // This might be overridden  },  "models": {    "User": {      "strictMode": {        "enabled": true  // This overrides the global setting      }    }  }}
```

### Configuration Not Applied[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration-not-applied "Direct link to Configuration Not Applied")

1.  Ensure your configuration file is properly referenced in the Prisma schema
2.  Check for JSON syntax errors
3.  Verify the configuration file path is correct
4.  Run generation again after configuration changes

### Unexpected Behavior[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#unexpected-behavior "Direct link to Unexpected Behavior")

-   **Model not found**: Ensure model names match exactly (case-sensitive)

-   **Operation not working**: Check operation names against the valid list above
-   **Variant issues**: Verify variant is enabled before configuring strict mode

---
Source: [Strict Mode Configuration | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/strict-mode)
# Naming & Presets | Prisma Zod Generator

## Pure Model Naming[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#pure-model-naming "Direct link to Pure Model Naming")

Pure model naming resolved by `resolvePureModelNaming`:

### Presets:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#presets "Direct link to Presets:")

-   `default`: `{Model}.schema.ts`, export `{Model}Schema` / type `{Model}Type`.

-   `zod-prisma`: same as default + legacy aliases.
-   `zod-prisma-types`: file `{Model}.schema.ts`, export `{Model}` (no suffixes), legacy aliases.

-   `legacy-model-suffix`: `{Model}.model.ts`, export `{Model}Model`.

### Overrides via `naming.pureModel`:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overrides-via-namingpuremodel "Direct link to overrides-via-namingpuremodel")

-   `filePattern` (`{Model}.schema.ts`, supports tokens `{Model}{SchemaSuffix}` etc.)

-   `schemaSuffix`, `typeSuffix`, `exportNamePattern`, `legacyAliases`.

Relation import rewriting adapts when using `.model` pattern.

## Schema Naming (CRUD Operations)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schema-naming-crud-operations "Direct link to Schema Naming (CRUD Operations)")

Schema naming resolved by `resolveSchemaNaming`:

### Default Patterns:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#default-patterns "Direct link to Default Patterns:")

-   `filePattern`: `{operation}{Model}.schema.ts`

-   `exportNamePattern`: `{Model}{Operation}Schema`

### Examples:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#examples "Direct link to Examples:")

-   `findManyUser.schema.ts` with export `UserFindManySchema`

-   `createOnePost.schema.ts` with export `PostCreateOneSchema`

### Overrides via `naming.schema`:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overrides-via-namingschema "Direct link to overrides-via-namingschema")

```
{  "naming": {    "schema": {      "filePattern": "{kebab}-{operation}-{model}.schema.ts",      "exportNamePattern": "{Model}{Operation}ValidationSchema"    }  }}
```

### ⚠️ Important Pattern Requirements[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#%EF%B8%8F-important-pattern-requirements "Direct link to ⚠️ Important Pattern Requirements")

**Operation Token Required**: Your `filePattern` MUST include an operation token (`{operation}` or `{Operation}`) to avoid file collisions. Without it, all CRUD operations for the same model will overwrite each other, resulting in only the last operation being generated.

**Examples**:

-   ✅ `{kebab}-{operation}-schema.ts` → `user-findMany-schema.ts`, `user-createOne-schema.ts`

-   ✅ `{operation}{Model}.schema.ts` → `findManyUser.schema.ts`, `createOneUser.schema.ts`
-   ❌ `{kebab}-schema.ts` → `user-schema.ts` (all operations overwrite each other!)

**Collision Detection**: The generator will detect filename collisions and throw an error during generation. Always include `{operation}` or `{Operation}` in your pattern.

### Available Tokens:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#available-tokens "Direct link to Available Tokens:")

-   `{Model}`: PascalCase model name (e.g., `User`, `BlogPost`)

-   `{model}`: camelCase model name (e.g., `user`, `blogPost`)
-   `{kebab}`: kebab-case model name (e.g., `user`, `blog-post`)

-   `{Operation}`: PascalCase operation (e.g., `FindMany`, `CreateOne`)
-   `{operation}`: camelCase operation (e.g., `findMany`, `createOne`)

## Input Object Naming[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#input-object-naming "Direct link to Input Object Naming")

Input object naming resolved by `resolveInputNaming`:

### Default Patterns:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#default-patterns-1 "Direct link to Default Patterns:")

-   `filePattern`: `{InputType}.schema.ts`

-   `exportNamePattern`: `{Model}{InputType}ObjectSchema`

### Examples:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#examples-1 "Direct link to Examples:")

-   `UserWhereInput.schema.ts` with export `UserWhereInputObjectSchema`

-   `PostCreateInput.schema.ts` with export `PostCreateInputObjectSchema`

### Overrides via `naming.input`:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overrides-via-naminginput "Direct link to overrides-via-naminginput")

```
{  "naming": {    "input": {      "filePattern": "{kebab}-{InputType}-input.ts",      "exportNamePattern": "{Model}{InputType}"    }  }}
```

### Available Tokens:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#available-tokens-1 "Direct link to Available Tokens:")

-   `{Model}`: PascalCase model name extracted from input type

-   `{model}`: camelCase model name
-   `{kebab}`: kebab-case model name (e.g., `user`, `blog-post`)

-   `{InputType}`: Full input type name (e.g., `UserWhereInput`, `PostCreateInput`)

### ⚠️ Important Pattern Requirements[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#%EF%B8%8F-important-pattern-requirements-1 "Direct link to ⚠️ Important Pattern Requirements")

**File Pattern Must Include Unique Identifiers**: Your `filePattern` must include tokens that make each input type unique. Without proper uniqueness, multiple input types for the same model will generate identical filenames and overwrite each other.

**Recommended Patterns**:

-   ✅ `{kebab}-{InputType}-input.ts` → `book-BookCreateInput-input.ts`

-   ✅ `{InputType}.schema.ts` → `BookCreateInput.schema.ts`
-   ✅ `inputs/{Model}/{InputType}.ts` → `inputs/Book/BookCreateInput.ts`

-   ❌ `{kebab}-input.ts` → `book-input.ts` (all Book inputs collide!)

**Pattern Collision Detection**: The generator will detect filename collisions and report errors during generation. If you see errors about duplicate filenames, ensure your pattern includes sufficient tokens to uniquely identify each input type.

**Note**: When your pattern includes a model token (`{Model}` or `{model}`) together with `{InputType}`, duplicate model prefixes are automatically stripped for both export names and file names to avoid results like `UserUserWhereInput*`.

## Enum Naming[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#enum-naming "Direct link to Enum Naming")

Enum naming resolved by `resolveEnumNaming`:

### Default Patterns:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#default-patterns-2 "Direct link to Default Patterns:")

-   `filePattern`: `{Enum}.schema.ts`

-   `exportNamePattern`: `{Enum}Schema`

### Examples:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#examples-2 "Direct link to Examples:")

-   `Role.schema.ts` with export `RoleSchema`

-   `UserStatus.schema.ts` with export `UserStatusSchema`

### Overrides via `naming.enum`:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overrides-via-namingenum "Direct link to overrides-via-namingenum")

```
{  "naming": {    "enum": {      "filePattern": "{Enum}Validator.schema.ts",      "exportNamePattern": "{Enum}ValidatorSchema"    }  }}
```

### Available Tokens:[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#available-tokens-2 "Direct link to Available Tokens:")

-   `{Enum}`: PascalCase enum name (e.g., `Role`, `UserStatus`)

-   `{enum}`: camelCase enum name (e.g., `role`, `userStatus`)
-   `{camel}`: camelCase alias (same as `{enum}` for enums)

## Complete Configuration Example[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#complete-configuration-example "Direct link to Complete Configuration Example")

```
{  "naming": {    "preset": "default",    "pureModel": {      "filePattern": "{Model}.model.ts",      "exportNamePattern": "{Model}Model"    },    "schema": {      "filePattern": "{operation}-{kebab}.schema.ts",      "exportNamePattern": "{Model}{Operation}ValidationSchema"    },    "input": {      "filePattern": "inputs/{InputType}.schema.ts",      "exportNamePattern": "{InputType}Schema"    },    "enum": {      "filePattern": "enums/{Enum}.enum.ts",      "exportNamePattern": "{Enum}EnumSchema"    }  }}
```

This would generate:

-   Pure models: `User.model.ts` → `UserModel`

-   Schemas: `findMany-user.schema.ts` → `UserFindManyValidationSchema`
-   Inputs: `inputs/UserWhereInput.schema.ts` → `UserWhereInputSchema`

-   Enums: `enums/Role.enum.ts` → `RoleEnumSchema`

---
Source: [Naming & Presets | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/naming)
# Optional Field Behavior | Prisma Zod Generator

The `optionalFieldBehavior` configuration option controls how optional Prisma fields (marked with `?`) are mapped to Zod validation schemas.

## Configuration Options[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration-options "Direct link to Configuration Options")

| Value | Zod Output | TypeScript Type | Description |
| --- | --- | --- | --- |
| `nullish` (default) | `.nullish()` | `T | null | undefined` | Field can be omitted, explicitly null, or have a value |
| `optional` | `.optional()` | `T | undefined` | Field can be omitted or have a value, but not null |
| `nullable` | `.nullable()` | `T | null` | Field must be present but can be null or have a value |

## Usage[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#usage "Direct link to Usage")

### Generator Block Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#generator-block-configuration "Direct link to Generator Block Configuration")

Configure directly in your `schema.prisma`:

```
generator zod {  provider = "prisma-zod-generator"  optionalFieldBehavior = "optional"}
```

### JSON Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#json-configuration "Direct link to JSON Configuration")

Or in your `zod-generator.config.json`:

```
{  "optionalFieldBehavior": "nullish"}
```

## Examples[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#examples "Direct link to Examples")

Given this Prisma model:

```
model User {  id    Int     @id @default(autoincrement())  email String  @unique  name  String?  // Optional field  bio   String?  // Optional field}
```

### Nullish Behavior (Default)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#nullish-behavior-default "Direct link to Nullish Behavior (Default)")

```
// Generated schemaconst UserCreateInputSchema = z.object({  email: z.string(),  name: z.string().nullish(),  bio: z.string().nullish()});// Valid inputs{ email: "test@example.com", name: "John", bio: "Developer" }{ email: "test@example.com", name: null, bio: undefined }{ email: "test@example.com" } // name and bio omitted
```

### Optional Behavior[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#optional-behavior "Direct link to Optional Behavior")

```
// Generated schemaconst UserCreateInputSchema = z.object({  email: z.string(),  name: z.string().optional(),  bio: z.string().optional()});// Valid inputs{ email: "test@example.com", name: "John", bio: "Developer" }{ email: "test@example.com", name: undefined, bio: undefined }{ email: "test@example.com" } // name and bio omitted// Invalid input{ email: "test@example.com", name: null } // ❌ null not allowed
```

### Nullable Behavior[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#nullable-behavior "Direct link to Nullable Behavior")

```
// Generated schemaconst UserCreateInputSchema = z.object({  email: z.string(),  name: z.string().nullable(),  bio: z.string().nullable()});// Valid inputs{ email: "test@example.com", name: "John", bio: "Developer" }{ email: "test@example.com", name: null, bio: null }// Invalid input{ email: "test@example.com" } // ❌ name and bio must be present
```

## Type Compatibility[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#type-compatibility "Direct link to Type Compatibility")

All three behaviors maintain full compatibility with Prisma's generated TypeScript types:

```
import { User } from '@prisma/client';// All generated schemas are compatible with Prisma typesconst prismaUser: Prisma.UserCreateInput = {  email: 'test@example.com',  name: null, // Prisma allows null for optional fields};// Works with any optionalFieldBehavior settingUserCreateInputSchema.parse(prismaUser); // ✅ Always valid
```

## Use Cases[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#use-cases "Direct link to Use Cases")

### API Validation[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#api-validation "Direct link to API Validation")

**Nullish** (default) is recommended for most API scenarios where clients can:

-   Omit fields entirely

-   Explicitly send null values
-   Send actual values

### Strict Input Validation[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#strict-input-validation "Direct link to Strict Input Validation")

**Optional** is useful when you want to:

-   Allow fields to be omitted

-   Reject explicit null values
-   Maintain clean undefined-only semantics

### Always-Present Fields[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#always-present-fields "Direct link to Always-Present Fields")

**Nullable** is suitable when:

-   Fields must always be included in requests

-   Null is a meaningful value
-   You want to distinguish between "not set" and "explicitly null"

## Object Schemas: Optional vs Nullable (Behavior Note)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#object-schemas-optional-vs-nullable-behavior-note "Direct link to Object Schemas: Optional vs Nullable (Behavior Note)")

For input object schemas under `objects/` (e.g., `UserCreateInput.schema.ts`, `PostUpdateInput.schema.ts`), the generator applies a policy that aligns Prisma optionality with practical API usage:

-   Optional non‑relation fields (scalars/enums/unions) are emitted as `.optional().nullable()` to accept both omission and explicit `null`.

-   Optional relation‑shaped fields remain `.optional()` only and reject `null` (use omission to skip).

Examples:

```
// Optional non-relation scalarname: z.string().optional().nullable()// Optional non-relation union (e.g., update operations)title: z.union([z.string(), TitleFieldUpdateOperationsInputObjectSchema]).optional().nullable()// Optional relation-shaped fieldsauthor: z.lazy(() => UserCreateNestedOneWithoutPostsInputObjectSchema).optional()         // ✅ undefined ok// author: null  // ❌ invalid, use omission instead
```

Additionally, in filter/where inputs, optional non-relation unions (e.g., `AND`, `OR`, `NOT`, or scalar filter unions) are treated as optional + nullable to allow `null` as a shorthand for “not applied”.

Rationale:

-   Prisma optional fields often map to nullable columns; allowing `null` and omission improves ergonomics for JSON clients while keeping relation operations explicit and unambiguous.

This policy applies to object input schemas irrespective of `optionalFieldBehavior` (which continues to control pure model and variant schema generation).

## Migration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#migration "Direct link to Migration")

When changing `optionalFieldBehavior`, regenerate your schemas:

```
npx prisma generate
```

All behaviors are functionally equivalent for validation - the choice depends on your API design preferences.

---
Source: [Optional Field Behavior | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/optional-fields)
# DateTime Strategy | Prisma Zod Generator

Configure how Prisma `DateTime` fields are validated in your generated Zod schemas.

## Overview[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overview "Direct link to Overview")

The generator supports two complementary controls for DateTime behavior:

-   dateTimeSplitStrategy (boolean, default: true) controls the default behavior when no explicit dateTimeStrategy is set.

-   dateTimeStrategy ('date' | 'coerce' | 'isoString') forces a specific mapping across all variants.

When dateTimeSplitStrategy is true and dateTimeStrategy is NOT set:

-   Input schemas default to z.coerce.date() (JSON-friendly — accepts ISO strings and coerces to Date)

-   Pure model and result schemas default to z.date()

When dateTimeStrategy is set, it takes precedence and applies to all variants.

## Split Strategy (Default)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#split-strategy-default "Direct link to Split Strategy (Default)")

With split enabled (default):

-   Inputs: z.coerce.date() (accepts ISO strings)

-   Pure/Results: z.date() This provides a JSON-first default for APIs while keeping strict Date objects in read models.

Disable split by setting "dateTimeSplitStrategy": false to revert to a single global default (see strategies below).

## Available Strategies[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#available-strategies "Direct link to Available Strategies")

### `date` (Default)[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#date-default "Direct link to date-default")

Generates strict `z.date()` validation that only accepts JavaScript Date objects.

```
{  "dateTimeStrategy": "date"}
```

**Generated schema:**

```
// For a createdAt: DateTime fieldcreatedAt: z.date()
```

**Usage:**

```
// ✅ Validconst data = { createdAt: new Date() };// ❌ Invalid - string not acceptedconst data = { createdAt: "2023-01-01T00:00:00Z" };
```

### `coerce`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#coerce "Direct link to coerce")

Generates `z.coerce.date()` validation that automatically converts valid date strings to Date objects.

```
{  "dateTimeStrategy": "coerce"}
```

**Generated schema:**

```
// For a createdAt: DateTime fieldcreatedAt: z.coerce.date()
```

**Usage:**

```
// ✅ Both valid - string automatically convertedconst data1 = { createdAt: new Date() };const data2 = { createdAt: "2023-01-01T00:00:00Z" };
```

### `isoString`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#isostring "Direct link to isostring")

Generates string validation with ISO 8601 regex pattern and transform to Date object.

```
{  "dateTimeStrategy": "isoString"}
```

**Generated schema:**

```
// For a createdAt: DateTime fieldcreatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/).transform(v => new Date(v))
```

**Usage:**

```
// ✅ Valid - ISO string accepted and transformedconst data = { createdAt: "2023-01-01T00:00:00.000Z" };// ❌ Invalid - must be valid ISO stringconst data = { createdAt: "invalid-date" };
```

## Configuration Examples[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration-examples "Direct link to Configuration Examples")

### Schema Generator Block[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schema-generator-block "Direct link to Schema Generator Block")

```
generator zod {  provider = "prisma-zod-generator"  output   = "./generated/zod"  config   = "./zod-generator.config.json"}
```

### JSON Configuration File[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#json-configuration-file "Direct link to JSON Configuration File")

```
// zod-generator.config.json{  "mode": "custom",  "dateTimeStrategy": "coerce",  "pureModels": true,  "variants": {    "pure": { "enabled": true, "suffix": ".model" },    "input": { "enabled": true, "suffix": ".input" },    "result": { "enabled": true, "suffix": ".result" }  }}
```

### Direct Generator Options[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#direct-generator-options "Direct link to Direct Generator Options")

```
generator zod {  provider         = "prisma-zod-generator"  output           = "./generated/zod"  dateTimeStrategy = "isoString"}
```

## Use Cases[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#use-cases "Direct link to Use Cases")

### `date` Strategy[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#date-strategy "Direct link to date-strategy")

-   **Best for:** Type-safe applications where you work with Date objects

-   **API validation:** When your frontend sends Date objects directly
-   **Internal validation:** Component props, function parameters

### `coerce` Strategy[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#coerce-strategy "Direct link to coerce-strategy")

-   **Best for:** API endpoints accepting flexible date input

-   **Form handling:** User input from date pickers or text fields
-   **Data migration:** Converting between different date formats

### `isoString` Strategy[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#isostring-strategy "Direct link to isostring-strategy")

-   **Best for:** Strict API contracts requiring ISO 8601 format

-   **Database consistency:** Ensuring standardized date string format
-   **Logging/serialization:** When you need predictable string representation

## Impact on Generated Schemas[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#impact-on-generated-schemas "Direct link to Impact on Generated Schemas")

The `dateTimeStrategy` affects all DateTime fields across:

-   **Pure models** (when `pureModels: true`)

-   **Input variants** (create, update operations)
-   **Result variants** (query responses)

-   **CRUD operation schemas**

### Example Model[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#example-model "Direct link to Example Model")

```
model Post {  id        String   @id @default(cuid())  title     String  createdAt DateTime @default(now())  updatedAt DateTime @updatedAt}
```

### Generated Output Comparison[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#generated-output-comparison "Direct link to Generated Output Comparison")

```
// dateTimeStrategy: "date"export const PostModel = z.object({  id: z.string(),  title: z.string(),  createdAt: z.date(),  updatedAt: z.date(),});// dateTimeStrategy: "coerce"  export const PostModel = z.object({  id: z.string(),  title: z.string(),  createdAt: z.coerce.date(),  updatedAt: z.coerce.date(),});// dateTimeStrategy: "isoString"export const PostModel = z.object({  id: z.string(),  title: z.string(),  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/).transform(v => new Date(v)),  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/).transform(v => new Date(v)),});
```

## Migration Guide[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#migration-guide "Direct link to Migration Guide")

When changing `dateTimeStrategy`, regenerate your schemas and update consuming code:

### From `date` to `coerce`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#from-date-to-coerce "Direct link to from-date-to-coerce")

-   No breaking changes for existing Date object usage

-   New: string inputs now accepted and converted

### From `date` to `isoString`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#from-date-to-isostring "Direct link to from-date-to-isostring")

-   **Breaking:** Only ISO strings accepted, Date objects rejected

-   Update client code to send ISO string format

### From `coerce` to `isoString`[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#from-coerce-to-isostring "Direct link to from-coerce-to-isostring")

-   **Breaking:** More restrictive validation

-   Non-ISO date strings will be rejected

-   [`pureModels`](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/modes): When enabled, affects pure model DateTime fields

-   [`variants`](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants): Controls which schema variants include DateTime strategy
-   [`optionalFieldBehavior`](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/optional-fields): May affect nullable DateTime fields

## Troubleshooting[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#troubleshooting "Direct link to Troubleshooting")

### Date Validation Errors[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#date-validation-errors "Direct link to Date Validation Errors")

```
// If using "date" strategy but sending stringsconst result = PostModel.safeParse({  title: "Hello",  createdAt: "2023-01-01" // ❌ String not accepted});// Solution: Convert to Date or use "coerce" strategyconst result = PostModel.safeParse({  title: "Hello",   createdAt: new Date("2023-01-01") // ✅ Date object});
```

### ISO String Format Issues[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#iso-string-format-issues "Direct link to ISO String Format Issues")

```
// If using "isoString" strategyconst result = PostModel.safeParse({  title: "Hello",  createdAt: "2023-1-1" // ❌ Invalid ISO format});// Solution: Use proper ISO 8601 formatconst result = PostModel.safeParse({  title: "Hello",  createdAt: "2023-01-01T00:00:00.000Z" // ✅ Valid ISO});
```

---
Source: [DateTime Strategy | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/datetime-strategy)
# JSON Schema Compatibility | Prisma Zod Generator

Generate schemas that are fully compatible with [Zod's JSON Schema conversion](https://zod.dev/json-schema) (`z.toJSONSchema()`), enabling seamless integration with OpenAPI documentation tools, API validators, and JSON Schema-based systems.

## Overview[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#overview "Direct link to Overview")

By default, Prisma Zod Generator creates schemas using Zod types that cannot be represented in JSON Schema:

-   `z.date()` for DateTime fields

-   `z.bigint()` for BigInt fields
-   `z.instanceof(Uint8Array)` for Bytes fields

-   `z.unknown()` for relations and JSON fields

When `jsonSchemaCompatible` is enabled, these types are automatically converted to JSON Schema-compatible alternatives while preserving validation logic.

## Configuration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#configuration "Direct link to Configuration")

### Basic Setup[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#basic-setup "Direct link to Basic Setup")

```
{  "jsonSchemaCompatible": true}
```

### Advanced Options[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#advanced-options "Direct link to Advanced Options")

```
{  "jsonSchemaCompatible": true,  "jsonSchemaOptions": {    "dateTimeFormat": "isoString",    "bigIntFormat": "string",     "bytesFormat": "base64String",    "conversionOptions": {      "unrepresentable": "any",      "cycles": "throw",      "reused": "inline"    }  }}
```

## Type Conversions[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#type-conversions "Direct link to Type Conversions")

### DateTime Fields[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#datetime-fields "Direct link to DateTime Fields")

**Default Behavior:**

```
// Generated schema (not JSON Schema compatible)z.date()
```

**JSON Schema Compatible:**

```
// ISO String format (default)z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, "Invalid ISO datetime")// ISO Date formatz.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid ISO date")
```

**Configuration:**

-   `dateTimeFormat: "isoString"` - Full ISO 8601 datetime (default)

-   `dateTimeFormat: "isoDate"` - ISO date only (YYYY-MM-DD)

### BigInt Fields[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#bigint-fields "Direct link to BigInt Fields")

**Default Behavior:**

```
// Generated schema (not JSON Schema compatible)z.bigint()
```

**JSON Schema Compatible:**

```
// String format (default)z.string().regex(/^\d+$/, "Invalid bigint string")// Number format (may lose precision for very large numbers)z.number().int()
```

**Configuration:**

-   `bigIntFormat: "string"` - Represents as string (default, preserves precision)

-   `bigIntFormat: "number"` - Represents as number (potential precision loss)

### Bytes Fields[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#bytes-fields "Direct link to Bytes Fields")

**Default Behavior:**

```
// Generated schema (not JSON Schema compatible)z.instanceof(Uint8Array)
```

**JSON Schema Compatible:**

```
// Base64 string format (default)z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/, "Invalid base64 string")// Hexadecimal string formatz.string().regex(/^[0-9a-fA-F]*$/, "Invalid hex string")
```

**Configuration:**

-   `bytesFormat: "base64String"` - Base64 encoded string (default)

-   `bytesFormat: "hexString"` - Hexadecimal encoded string

### Relations and JSON Fields[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#relations-and-json-fields "Direct link to Relations and JSON Fields")

**Default Behavior:**

```
// Generated schema (not JSON Schema compatible)z.unknown()
```

**JSON Schema Compatible:**

```
// Allows any value (JSON Schema compatible)z.any()
```

## Usage Examples[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#usage-examples "Direct link to Usage Examples")

### Basic Usage[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#basic-usage "Direct link to Basic Usage")

```
import { z } from 'zod';import { UserModelSchema } from './generated/schemas/variants/pure/User.pure';// Convert to JSON Schemaconst jsonSchema = z.toJSONSchema(UserModelSchema);// Use with OpenAPIconst openApiSpec = {  components: {    schemas: {      User: jsonSchema    }  }};
```

### OpenAPI Integration[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#openapi-integration "Direct link to OpenAPI Integration")

```
import { z } from 'zod';import {   UserCreateInputSchema,  UserUpdateInputSchema,  UserModelSchema } from './generated/schemas';// Generate OpenAPI schemasconst schemas = {  UserCreateRequest: z.toJSONSchema(UserCreateInputSchema),  UserUpdateRequest: z.toJSONSchema(UserUpdateInputSchema),  UserResponse: z.toJSONSchema(UserModelSchema)};// Use in OpenAPI specconst openApiSpec = {  openapi: '3.0.0',  components: { schemas },  paths: {    '/users': {      post: {        requestBody: {          content: {            'application/json': {              schema: { $ref: '#/components/schemas/UserCreateRequest' }            }          }        },        responses: {          '201': {            content: {              'application/json': {                schema: { $ref: '#/components/schemas/UserResponse' }              }            }          }        }      }    }  }};
```

### API Documentation Generation[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#api-documentation-generation "Direct link to API Documentation Generation")

```
import { z } from 'zod';// Import any generated schemaimport { PostModelSchema } from './generated/schemas/variants/pure/Post.pure';// Generate documentation-friendly JSON Schemaconst postSchema = z.toJSONSchema(PostModelSchema, {  target: 'openApi3',  unrepresentable: 'any'});// Use with documentation generators like @apidevtools/swagger-jsdocconst swaggerSpec = {  openapi: '3.0.0',  info: { title: 'API', version: '1.0.0' },  components: {    schemas: {      Post: postSchema    }  }};
```

## Schema Variants Support[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schema-variants-support "Direct link to Schema Variants Support")

JSON Schema compatibility works across all schema variants:

### Pure Models[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#pure-models "Direct link to Pure Models")

```
import { UserModelSchema } from './generated/schemas/variants/pure/User.pure';const userJsonSchema = z.toJSONSchema(UserModelSchema);
```

### Input Schemas[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#input-schemas "Direct link to Input Schemas")

```
import { UserCreateInputSchema } from './generated/schemas/variants/input/User.input';const createUserJsonSchema = z.toJSONSchema(UserCreateInputSchema);
```

### Result Schemas[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#result-schemas "Direct link to Result Schemas")

```
import { UserFindManyResultSchema } from './generated/schemas/variants/result/User.result';const findManyJsonSchema = z.toJSONSchema(UserFindManyResultSchema);
```

## Conversion Options[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#conversion-options "Direct link to Conversion Options")

Configure how `z.toJSONSchema()` handles edge cases:

```
{  "jsonSchemaCompatible": true,  "jsonSchemaOptions": {    "conversionOptions": {      "unrepresentable": "any",      "cycles": "throw",       "reused": "inline"    }  }}
```

### Options Reference[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#options-reference "Direct link to Options Reference")

-   **`unrepresentable`**: How to handle unrepresentable types

    -   `"any"` - Convert to `any` type (default)
    -   `"throw"` - Throw error on unrepresentable types
-   **`cycles`**: How to handle circular references

    -   `"throw"` - Throw error on cycles (default)
    -   `"ref"` - Use JSON Schema references
-   **`reused`**: How to handle reused schemas

    -   `"inline"` - Inline repeated schemas (default)
    -   `"ref"` - Use JSON Schema references

## Validation Behavior[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#validation-behavior "Direct link to Validation Behavior")

JSON Schema compatible schemas maintain validation while changing representation:

```
// DateTime validationconst dateString = "2023-12-25T10:30:00.000Z";const result = UserModelSchema.parse({ createdAt: dateString });// ✅ Validates against ISO datetime regex// BigInt validation  const bigIntString = "12345678901234567890";const result2 = PostModelSchema.parse({ likes: bigIntString });// ✅ Validates against numeric string regex// Bytes validationconst base64String = "SGVsbG8gV29ybGQ=";const result3 = PostModelSchema.parse({ data: base64String });// ✅ Validates against base64 regex
```

## Performance Considerations[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#performance-considerations "Direct link to Performance Considerations")

-   **Regex Validation**: JSON Schema compatible mode uses regex validation which may be slightly slower than native type checking

-   **String Conversion**: Applications need to handle string-to-type conversion in business logic
-   **Memory Usage**: Regex patterns add minimal memory overhead

## Migration Guide[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#migration-guide "Direct link to Migration Guide")

### From Regular Schemas[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#from-regular-schemas "Direct link to From Regular Schemas")

1.  **Enable compatibility mode:**

```
{  "jsonSchemaCompatible": true}
```

2.  **Update application code:**

```
// Before: Date objectsconst user = { createdAt: new Date() };// After: ISO strings  const user = { createdAt: new Date().toISOString() };
```

3.  **Update validation:**

```
// Before: Direct usageconst result = UserModelSchema.parse(userData);// After: Convert types as neededconst result = UserModelSchema.parse({  ...userData,  createdAt: userData.createdAt.toISOString(),  likes: userData.likes.toString()});
```

## Troubleshooting[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#troubleshooting "Direct link to Troubleshooting")

### Common Issues[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#common-issues "Direct link to Common Issues")

**Error: "Cannot be represented in JSON Schema"**

```
Solution: Ensure jsonSchemaCompatible is enabled in configuration
```

**Validation failing with valid data**

```
// Check that data matches expected string formatsconst validDateTime = "2023-12-25T10:30:00.000Z"; // ✅const invalidDateTime = "Dec 25, 2023";           // ❌
```

**Precision loss with BigInt**

```
// Use string format for large numbers{  "jsonSchemaOptions": {    "bigIntFormat": "string"  // Preserves precision  }}
```

### Debugging[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#debugging "Direct link to Debugging")

Enable debug logging to see conversion details:

```
DEBUG_PRISMA_ZOD=1 prisma generate
```

-   [DateTime Strategy](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/datetime-strategy) - Configure DateTime handling

-   [Variants](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants) - Schema variant configuration
-   [Zod JSON Schema Documentation](https://zod.dev/json-schema) - Official Zod JSON Schema docs

---
Source: [JSON Schema Compatibility | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/json-schema-compatibility)
# Dual Schema Exports | Prisma Zod Generator

Type-safe + method-friendly exports for CRUD argument schemas.

## Rationale[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#rationale "Direct link to Rationale")

Traditional choice: bind `z.ZodType<Prisma.X>` (great inference, limited chaining) vs plain Zod (full chaining, looser typing). Generator emits both.

## What You Get[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#what-you-get "Direct link to What You Get")

```
export const PostFindManySchema: z.ZodType<Prisma.PostFindManyArgs> = base;export const PostFindManyZodSchema = base;
```

Typed one locks inference to Prisma.\*; Zod one supports all refinements/extensions.

## Enabling / Disabling[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#enabling--disabling "Direct link to Enabling / Disabling")

Generator block flags (not JSON config):

```
generator zod {  provider           = "prisma-zod-generator"  exportTypedSchemas = true   // default  exportZodSchemas   = true   // default  typedSchemaSuffix  = "Schema"    // default  zodSchemaSuffix    = "ZodSchema" // default}
```

Disable one side to shrink surface:

```
exportTypedSchemas = false
```

## Suffix Customization[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#suffix-customization "Direct link to Suffix Customization")

Change names to fit convention:

```
typedSchemaSuffix = "Args"zodSchemaSuffix   = "Validator"
```

Produces `PostFindManyArgs` and `PostFindManyValidator`.

## Single File Mode[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#single-file-mode "Direct link to Single File Mode")

Both exports inlined; tree-shakers can drop unused variant if imported selectively.

## When to Prefer One[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#when-to-prefer-one "Direct link to When to Prefer One")

-   Library boundary: use typed version for stable contract.

-   App code needing transformation: use Zod version then `.parse`.

## Interactions[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#interactions "Direct link to Interactions")

-   No effect on pure model schemas (they are single export each).

-   Result schemas follow same pattern.

## Troubleshooting[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#troubleshooting "Direct link to Troubleshooting")

If you only see one export: verify flags or earlier README examples; ensure no custom fork removed dual export logic.

---
Source: [Dual Schema Exports | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/dual-exports)
# Model / Operation / Field Filtering | Prisma Zod Generator

Model enable check: `isModelEnabled` (minimal mode defaults to disabled unless configured).

Operation filtering: `isOperationEnabled` with alias mapping (createOne→create, etc.). Minimal mode reduces allowed ops unless overridden.

## Schema-Level Filtering[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#schema-level-filtering "Direct link to Schema-Level Filtering")

In minimal mode, entire schema types are filtered out to reduce complexity:

**Blocked in minimal mode:**

-   `*CreateInput` schemas (use `*UncheckedCreateInput` instead)

-   Nested relation inputs (`*CreateNestedInput`, `*UpdateNestedInput`)
-   Complex relation patterns (`*CreateWithoutInput`, `*CreateOrConnectWithoutInput`)

-   Aggregation inputs (`*AggregateInput`, etc.)
-   Select/Include helper schemas

**Always allowed:**

-   `*UncheckedCreateInput` (simple foreign key-based creation)

-   `*UpdateInput` and `*UncheckedUpdateInput` (update flexibility)
-   `*WhereInput` and `*WhereUniqueInput` (query filtering)

-   `*OrderByWithRelationInput` (sorting)

## Field-Level Filtering[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#field-level-filtering "Direct link to Field-Level Filtering")

Field filtering precedence (stop at first include win):

1.  `model.fields.include`
2.  Model variant `excludeFields`
3.  Legacy `model.fields.exclude`
4.  `globalExclusions[variant]`
5.  Global array legacy excludes

Wildcard patterns supported: `field*`, `*field`, `*middle*`.

WhereUniqueInput & strict base create inputs bypass variant exclusions to preserve shape fidelity.

Excluded relation fields cause foreign key scalar preservation for create inputs (maintain referential integrity constraints).

## Optional Early Validation for WhereUniqueInput[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#optional-early-validation-for-whereuniqueinput "Direct link to Optional Early Validation for WhereUniqueInput")

By default, `WhereUniqueInput` schemas include only unique selector fields (single-field uniques and named composite unique objects). Top-level keys are optional to match Prisma, and completeness for composite selectors is enforced by the nested composite object schemas themselves.

If you want early failure when no selector is present (e.g., rejecting `{}` before reaching Prisma), enable this opt-in flag in your JSON config:

```
// zod-generator.config.json{  "validateWhereUniqueAtLeastOne": true}
```

This adds a minimal superRefine that checks only the presence of at least one top-level selector. It does not enforce “exactly one” (Prisma will still validate that at runtime) and does not attempt to peek into nested composite fields (those are already required by their own schemas).

---
Source: [Model / Operation / Field Filtering | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/filtering)
# Emission Controls | Prisma Zod Generator

Flags under `emit` can disable whole categories early:

-   `enums`

-   `objects` (input object schemas)
-   `crud` (operation argument/result grouping)

-   `pureModels`
-   `variants` (wrapper / variant sets)

-   `results` (result schemas)

Skipping enums while generating objects or CRUD may break references → warning emitted.

Heuristic shortcuts (`pureModelsOnlyMode`, `pureVariantOnlyMode`) suppress objects / CRUD regardless of their flags.

See also: [Dual Schema Exports](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/dual-exports) for typed vs method-friendly CRUD/result schema pairs.

---
Source: [Emission Controls | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/emission-controls)
# File Layout & Single File Mode | Prisma Zod Generator

Options:

-   `useMultipleFiles` (default true)

-   `singleFileName` (default `schemas.ts`)
-   `placeSingleFileAtRoot` (default true) – root of output vs `schemas/` subdir

-   `placeArrayVariantsAtRoot` (only for array variants)

Single-file mode:

1.  Aggregates generated content (initSingleFile)
2.  Writes final bundle (flushSingleFile)
3.  Cleans sibling files in target directory
4.  Disables variant emission path

Layout conflicts between generator block & JSON config are surfaced (generator block wins).

---
Source: [File Layout & Single File Mode | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/file-layout)
# JSON Schema IntelliSense | Prisma Zod Generator

The generator ships a full [JSON Schema draft‑07](https://json-schema.org/) definition for every config option. Point your config files at it once and editors, CI scripts, and custom tooling all get the same contract the generator enforces internally.

## Quick Start[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#quick-start "Direct link to Quick Start")

1.  Make sure `prisma-zod-generator` is installed (the schema is published with every npm release under `lib/config/schema.json`).
2.  Open the config file you pass through the Prisma generator block (for example `prisma/config.json`, `zod-generator.config.json`, or whatever you set via `config = "./..."`).
3.  Add a `$schema` field that points to the installed package:

prisma/config.json

```
{  "$schema": "../node_modules/prisma-zod-generator/lib/config/schema.json",  "mode": "full",  "pureModels": true}
```

Save the file and your editor immediately enables IntelliSense, hover docs, and red squiggles for invalid values.

## Picking the Right Path[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#picking-the-right-path "Direct link to Picking the Right Path")

-   **Relative to config file** – Recommended because it survives CI and other machines. Use `../node_modules/...` if your config file sits inside the `prisma/` directory, or `./node_modules/...` if it lives at the project root.

-   **Absolute path** – Works for quick tests but breaks across machines. Prefer relative paths once you confirm things locally.
-   **Hosted copy** – If you host the schema at a stable URL (for example on your docs site or an internal CDN), set `$schema` to the HTTPS URL. Any consumer that understands JSON Schema will pull it remotely.

## Programmatic Validation[​](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/variants#programmatic-validation "Direct link to Programmatic Validation")

Need to fail CI when someone pushes an invalid config? Reuse the same schema through the compiled validator:

scripts/validate-config.ts

```
import { readFileSync } from 'node:fs';import { ConfigurationValidator } from 'prisma-zod-generator/lib/config/validator.js';const configPath = process.argv[2] ?? './prisma/config.json';const validator = new ConfigurationValidator();const config = JSON.parse(readFileSync(configPath, 'utf8'));const result = validator.validate(config);if (!result.valid) {  console.error('❌ Invalid Prisma Zod Generator config:');  console.error(result.errors);  process.exit(1);}console.log('✅ Config looks good');
```

Pair this with the `$schema` hint so editors catch problems before CI does.

Once the `$schema` field is in place, every upgrade automatically refreshes the schema definition because the path always points to the version installed in `node_modules`.

---
Source: [JSON Schema IntelliSense | Prisma Zod Generator](https://omar-dulaimi.github.io/prisma-zod-generator/docs/config/schema-json)
