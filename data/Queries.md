## Migrating to Relational Queries version 2

WARNING

This page explains concepts available on drizzle versions `1.0.0-beta.1` and higher.

```
npm i drizzle-orm@beta
npm i drizzle-kit@beta -D
```

```
yarn add drizzle-orm@beta
yarn add drizzle-kit@beta -D
```

```
pnpm add drizzle-orm@beta
pnpm add drizzle-kit@beta -D
```

```
bun add drizzle-orm@beta
bun add drizzle-kit@beta -D
```

### API changes[](https://orm.drizzle.team/docs/relations-v1-v2#api-changes)

#### What is working differently from v1[](https://orm.drizzle.team/docs/relations-v1-v2#what-is-working-differently-from-v1)

One of the biggest updates were in **Relations Schema definition**

The first difference is that you no longer need to specify `relations` for each table separately in different objects and then pass them all to `drizzle()` along with your schema. In Relational Queries v2, you now have one dedicated place to specify all the relations for all the tables you need.

The `r` parameter in the callback provides comprehensive autocomplete functionality - including all tables from your schema and functions such as `one`, `many`, and `through` - essentially offering everything you need to specify your relations.

```
// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"

export const relations = defineRelations(schema, (r) => ({
    ...
}));
```

```
// index.ts
import { relations } from "./relations"
import { drizzle } from "drizzle-orm/..."

const db = drizzle(process.env.DATABASE_URL, { relations })
```

##### What is different?[](https://orm.drizzle.team/docs/relations-v1-v2#what-is-different)

```
import * as p from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = p.pgTable('users', {
id: p.integer().primaryKey(),
name: p.text(),
invitedBy: p.integer('invited_by'),
});

export const posts = p.pgTable('posts', {
id: p.integer().primaryKey(),
content: p.text(),
authorId: p.integer('author_id'),
});
```

**One place for all your relations**

❌ v1

```
import { relations } from "drizzle-orm/_relations";
import { users, posts } from './schema';

export const usersRelation = relations(users, ({ one, many }) => ({
  invitee: one(users, {
    fields: [users.invitedBy],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelation = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

✅ v2

```
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    invitee: r.one.users({
      from: r.users.invitedBy,
      to: r.users.id,
    }),
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
}));
```

You can still separate it into different `parts`, and you can make the parts any size you want

```
import { defineRelations, defineRelationsPart } from 'drizzle-orm';
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    invitee: r.one.users({
      from: r.users.invitedBy,
      to: r.users.id,
    }),
    posts: r.many.posts(),
  }
}));

export const part = defineRelationsPart(schema, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  }
}));
```

and then you can provide it to the db instance

```
const db = drizzle(process.env.DB_URL, { relations: { ...relations, ...part } })
```

**Define `many` without `one`**

In v1, if you wanted only the `many` side of a relationship, you had to specify the `one` side on the other end, which made for a poor developer experience.

In v2, you can simply use the `many` side without any additional steps

❌ v1

```
import { relations } from "drizzle-orm/_relations";
import { users, posts } from './schema';

export const usersRelation = relations(users, ({ one, many }) => ({
  posts: many(posts),
}));

export const postsRelation = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

✅ v2

```
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts({
      from: r.users.id,
      to: r.posts.authorId,
    }),
  },
}));
```

**New `optional` option**

`optional: false` at the type level makes the `author` key in the `posts` object required. This should be used when you are certain that this specific entity will always exist.

❌ v1

✅ v2

```
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts({
      from: r.users.id,
      to: r.posts.authorId,
      optional: false,
    }),
  },
}));
```

**No modes in `drizzle()`**

We found a way to use the same strategy for all MySQL dialects, so there’s no need to specify them

❌ v1

```
import * as schema from './schema'

const db = drizzle(process.env.DATABASE_URL, { mode: "planetscale", schema });
// or
const db = drizzle(process.env.DATABASE_URL, { mode: "default", schema });
```

✅ v2

```
import { relations } from './relations'

const db = drizzle(process.env.DATABASE_URL, { relations });
```

**`from` and `to` upgrades**

We’ve renamed `fields` to `from` and `references` to `to`, and we made both accept either a single value or an array

❌ v1

```
...
author: one(users, {
  fields: [posts.authorId],
  references: [users.id],
}),
...
```

✅ v2

```
...
author: r.one.users({
  from: r.posts.authorId,
  to: r.users.id,
}),
...
```

```
...
author: r.one.users({
  from: [r.posts.authorId],
  to: [r.users.id],
}),
...
```

**`relationName` -> `alias`**

❌ v1

```
import { relations } from "drizzle-orm/_relations";
import { users, posts } from './schema';

export const postsRelation = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  relationName: "author_post",
  }),
}));
```

✅ v2

```
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
      alias: "author_post",
    }),
  },
}));
```

**`custom types` new functions**

There are a few new function were added to custom types, so you can control how data is mapped on Relational Queries v2:

Optional mapping function, that is used for transforming data returned by transformed to JSON in database data to desired format For example, when querying bigint column via [RQB](https://orm.drizzle.team/docs/rqb-v2) or [JSON functions](https://orm.drizzle.team/docs/json-functions), the result field will be returned as it’s string representation, as opposed to bigint from regular query To handle that, we need a separate function to handle such field’s mapping:

```
fromJson(value: string): bigint {
return BigInt(value);
},
```

It’ll cause the returned data to change from:

```
{
customField: "5044565289845416380";
}
```

to:

```
{
customField: 5044565289845416380n;
}
```

Optional selection modifier function, that is used for modifying selection of column inside [JSON functions](https://orm.drizzle.team/docs/json-functions) Additional mapping that could be required for such scenarios can be handled using fromJson function Used by [relational queries](https://orm.drizzle.team/docs/rqb-v2)

For example, when using bigint we need to cast field to text to preserve data integrity

```
forJsonSelect(identifier: SQL, sql: SQLGenerator, arrayDimensions?: number): SQL {
return sql`${identifier}::text`
},
```

This will change query from:

```
SELECT
row_to_json("t".*)
FROM
(
SELECT
"table"."custom_bigint" AS "bigint"
FROM
"table"
) AS "t"
```

to:

```
SELECT
row_to_json("t".*)
FROM
(
SELECT
"table"."custom_bigint"::text AS "bigint"
FROM
"table"
) AS "t"
```

Returned by query object will change from:

```
{
bigint: 5044565289845416000; // Partial data loss due to direct conversion to JSON format
}
```

to:

```
{
bigint: "5044565289845416380"; // Data is preserved due to conversion of field to text before JSON-ification
}
```

✅ v2

```
const customBytes = customType<{
 data: Buffer;
 driverData: Buffer;
 jsonData: string;
 }>({
 dataType: () => 'bytea',
 fromJson: (value) => {
 return Buffer.from(value.slice(2, value.length), 'hex');
 },
 forJsonSelect: (identifier, sql, arrayDimensions) =>
 sql`${identifier}::text${sql.raw('[]'.repeat(arrayDimensions ?? 0))}`,
 });
```

##### What is new?[](https://orm.drizzle.team/docs/relations-v1-v2#what-is-new)

**`through` for many-to-many relations**

Previously, you would need to query through a junction table and then map it out for every response

You don’t need to do it now!

```
import * as p from "drizzle-orm/pg-core";

export const users = p.pgTable("users", {
  id: p.integer().primaryKey(),
  name: p.text(),
  verified: p.boolean().notNull(),
});

export const groups = p.pgTable("groups", {
  id: p.integer().primaryKey(),
  name: p.text(),
});

export const usersToGroups = p.pgTable(
  "users_to_groups",
  {
    userId: p
      .integer("user_id")
      .notNull()
      .references(() => users.id),
    groupId: p
      .integer("group_id")
      .notNull()
      .references(() => groups.id),
  },
  (t) => [p.primaryKey({ columns: [t.userId, t.groupId] })]
);
```

❌ v1

```
export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  usersToGroups: many(usersToGroups),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
}));
```

```
// Query example
const response = await db.query.users.findMany({
  with: {
    usersToGroups: {
      columns: {},
      with: {
        group: true,
      },
    },
  },
});
```

✅ v2

```
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';

export const relations = defineRelations(schema, (r) => ({
  users: {
    groups: r.many.groups({
      from: r.users.id.through(r.usersToGroups.userId),
      to: r.groups.id.through(r.usersToGroups.groupId),
    }),
  },
  groups: {
    participants: r.many.users(),
  },
}));
```

```
// Query example
const response = await db.query.users.findMany({
  with: {
    groups: true,
  },
});
```

**Predefined filters**

❌ v1

✅ v2

```
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';

export const relations = defineRelations(schema,
  (r) => ({
    groups: {
      verifiedUsers: r.many.users({
        from: r.groups.id.through(r.usersToGroups.groupId),
        to: r.users.id.through(r.usersToGroups.userId),
        where: {
          verified: true,
        },
      }),
    },
  })
);
```

```
// Query example: get groups with all verified users
const response = await db.query.groups.findMany({
  with: {
    verifiedUsers: true,
  },
});
```

##### `where` is now object[](https://orm.drizzle.team/docs/relations-v1-v2#where-is-now-object)

❌ v1

```
const response = db._query.users.findMany({
  where: (users, { eq }) => eq(users.id, 1),
});
```

✅ v2

```
const response = db.query.users.findMany({
  where: {
    id: 1,
  },
});
```

For a complete API Reference please check our [Select Filters docs](https://orm.drizzle.team/docs/rqb-v2#select-filters)

Complex filter example using RAW

```
// schema.ts
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  age: integer("age"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  subscriptionEnd: timestamp("subscription_end"),
  lastActivity: timestamp("last_activity"),
  preferences: jsonb("preferences"),      // JSON column for user settings/preferences
  interests: text("interests").array(),     // Array column for user interests
});
```

```
const response = db.query.users.findMany({
  where: {
    AND: [
      {
        OR: [
          { RAW: (table) => sql`LOWER(${table.name}) LIKE 'john%'` },
          { name: { ilike: "jane%" } },
        ],
      },
      {
        OR: [
          { RAW: (table) => sql`${table.preferences}->>'theme' = 'dark'` },
          { RAW: (table) => sql`${table.preferences}->>'theme' IS NULL` },
        ],
      },
      { RAW: (table) => sql`${table.age} BETWEEN 25 AND 35` },
    ],
  },
});
```

##### `orderBy` is now object[](https://orm.drizzle.team/docs/relations-v1-v2#orderby-is-now-object)

❌ v1

```
const response = db._query.users.findMany({
  orderBy: (users, { asc }) => [asc(users.id)],
});
```

✅ v2

```
const response = db.query.users.findMany({
  orderBy: { id: "asc" },
});
```

##### Filtering by relations[](https://orm.drizzle.team/docs/relations-v1-v2#filtering-by-relations)

❌ v1

✅ v2

Example: Get all users whose ID>10 and who have at least one post with content starting with “M”

```
const usersWithPosts = await db.query.usersTable.findMany({
  where: {
    id: {
      gt: 10
    },
    posts: {
      content: {
        like: 'M%'
      }
    }
  },
});
```

❌ v1

✅ v2

```
await db.query.posts.findMany({
limit: 5,
offset: 2, // correct ✅
with: {
comments: {
offset: 3, // correct ✅
limit: 3,
},
},
});
```

#### How to migrate relations schema definition from v1 to v2[](https://orm.drizzle.team/docs/relations-v1-v2#how-to-migrate-relations-schema-definition-from-v1-to-v2)

##### **Option 1**: Using `drizzle-kit pull`[](https://orm.drizzle.team/docs/relations-v1-v2#option-1-using-drizzle-kit-pull)

In new version `drizzle-kit pull` supports pulling `relations.ts` file in a new syntax:

##### Step 1[](https://orm.drizzle.team/docs/relations-v1-v2#step-1)

```
npx drizzle-kit pull
```

```
yarn drizzle-kit pull
```

```
pnpm drizzle-kit pull
```

```
bunx drizzle-kit pull
```

#### Step 2[](https://orm.drizzle.team/docs/relations-v1-v2#step-2)

Transfer generated relations code from `drizzle/relations.ts` to the file you are using to specify your relations

```
 ├ 📂 drizzle
 │ ├ 📂 meta
 │ ├ 📜 migration.sql
 │ ├ 📜 relations.ts ────────┐
 │ └ 📜 schema.ts            |
 ├ 📂 src                    │
 │ ├ 📂 db                   │
 │ │ ├ 📜 relations.ts <─────┘
 │ │ └ 📜 schema.ts
 │ └ 📜 index.ts
 └ …
```

`drizzle/relations.ts` includes an import of all tables from `drizzle/schema.ts`, which looks like this:

```
import * as schema from './schema'
```

You may need to change this import to a file where ALL your schema tables are located.

If there are multiple schema files, you can do the following:

```
import * as schema1 from './schema1'
import * as schema2 from './schema2'
...
```

#### Step 3[](https://orm.drizzle.team/docs/relations-v1-v2#step-3)

Change drizzle database instance creation and provide `relations` object instead of `schema`

Before

```
import * as schema from './schema'
import { drizzle } from 'drizzle-orm/...'

const db = drizzle('<url>', { schema })
```

After

```
// should be imported from a file in Step 2
import { relations } from './relations'
import { drizzle } from 'drizzle-orm/...'

const db = drizzle('<url>', { relations })
```

If you had MySQL dialect, you can remove `mode` from `drizzle()` as long as it’s not needed in version 2

##### Manual migration[](https://orm.drizzle.team/docs/relations-v1-v2#manual-migration)

If you want to migrate manually, you can check our [Drizzle Relations section](https://orm.drizzle.team/docs/relations-v2) for the complete API reference and examples of one-to-one, one-to-many, and many-to-many relations.

#### How to migrate queries from v1 to v2[](https://orm.drizzle.team/docs/relations-v1-v2#how-to-migrate-queries-from-v1-to-v2)

##### Migrate `where` statements[](https://orm.drizzle.team/docs/relations-v1-v2#migrate-where-statements)

You can check our [Select Filters docs](https://orm.drizzle.team/docs/rqb-v2#select-filters) to see examples and a complete API reference.

With the new syntax, you can use `AND`, `OR`, `NOT`, and `RAW`, plus all the filtering operators that were previously available in Relations v1.

**Examples**

simple eq

using AND

using OR

using NOT

complex example using RAW

```
// schema.ts
import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  age: integer("age"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  subscriptionEnd: timestamp("subscription_end"),
  lastActivity: timestamp("last_activity"),
  preferences: jsonb("preferences"),      // JSON column for user settings/preferences
  interests: text("interests").array(),     // Array column for user interests
});
```

```
const response = db.query.users.findMany({
  where: {
    AND: [
      {
        OR: [
          { RAW: (table) => sql`LOWER(${table.name}) LIKE 'john%'` },
          { name: { ilike: "jane%" } },
        ],
      },
      {
        OR: [
          { RAW: (table) => sql`${table.preferences}->>'theme' = 'dark'` },
          { RAW: (table) => sql`${table.preferences}->>'theme' IS NULL` },
        ],
      },
      { RAW: (table) => sql`${table.age} BETWEEN 25 AND 35` },
    ],
  },
});
```

##### Migrate `orderBy` statements[](https://orm.drizzle.team/docs/relations-v1-v2#migrate-orderby-statements)

Order by was simplified to a single object, where you specify the column and the sort direction (`asc` or `desc`)

❌ v1

```
const response = db._query.users.findMany({
  orderBy: (users, { asc }) => [asc(users.id)],
});
```

✅ v2

```
const response = db.query.users.findMany({
  orderBy: { id: "asc" },
});
```

##### Migrate `many-to-many` queries[](https://orm.drizzle.team/docs/relations-v1-v2#migrate-many-to-many-queries)

Relational Queries v1 had a very complex way of managing many-to-many queries. You had to use junction tables to query through them explicitly, and then map those tables out, like this:

```
const response = await db.query.users.findMany({
  with: {
    usersToGroups: {
      columns: {},
      with: {
        group: true,
      },
    },
  },
});
```

After upgrading to Relational Queries v2, your many-to-many relation will look like this:

```
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';

export const relations = defineRelations(schema, (r) => ({
  users: {
    groups: r.many.groups({
      from: r.users.id.through(r.usersToGroups.userId),
      to: r.groups.id.through(r.usersToGroups.groupId),
    }),
  },
  groups: {
    participants: r.many.users(),
  },
}));
```

And when you migrate your query, it will become this:

```
// Query example
const response = await db.query.users.findMany({
  with: {
    groups: true,
  },
});
```

#### Partial upgrade or how to stay on RQB v1 even after an upgrade?[](https://orm.drizzle.team/docs/relations-v1-v2#partial-upgrade-or-how-to-stay-on-rqb-v1-even-after-an-upgrade)

We’ve made an upgrade in a way, that all previous queries and relations definitions are still available for you. In this case you can migrate your codebase query by query without a need for a huge refactoring

##### Step 1: Change relations import[](https://orm.drizzle.team/docs/relations-v1-v2#step-1-change-relations-import)

To define relations using Relational Queries v1, you would need to import it from `drizzle-orm`

v1

```
import { relations } from 'drizzle-orm';
```

In Relational Queries v2 we moved it to `drizzle-orm/_relations` to give you some time for a migration

v2

```
import { relations } from "drizzle-orm/_relations";
```

##### Step 2: Replace your queries to `._query`[](https://orm.drizzle.team/docs/relations-v1-v2#step-2-replace-your-queries-to-_query)

To use Relational Queries v1 you had to write `db.query.`

v1

```
await db.query.users.findMany();
```

In Relational Queries v2, we moved it to `db._query` so that `db.query` could be used for a new syntax, while still giving you the option to use the old syntax via `db._query`.

We had a long discussion about whether we should just deprecate `db.query` and replace it with something like `db.query2` or `db.queryV2`. In the end, we decided that all new APIs should remain as simple as `db.query`, and that requiring you to replace all of your queries with `db._query` if you want to keep using the old syntax is preferable to forcing everyone in the future to use `db.queryV2`, `db.queryV3`, `db.queryV4`, etc.

v2

```
// Using RQBv1
await db._query.users.findMany();

// Using RQBv2
await db.query.users.findMany();
```

##### Step 3[](https://orm.drizzle.team/docs/relations-v1-v2#step-3-1)

Define new relations or pull them using [this guide](https://orm.drizzle.team/docs/relations-v1-v2#how-to-migrate-relations-schema-definition-from-v1-to-v2), then use them in your new queries or migrate your existing queries one by one.

### Internal changes[](https://orm.drizzle.team/docs/relations-v1-v2#internal-changes)

1.  Every `drizzle` database, `session`, `migrator` and `transaction` instance, gained 2 additional generic arguments for RQB v2 queries

**migrator**

before

```
export async function migrate<
  TSchema extends Record<string, unknown>
>(
  db: NodePgDatabase<TSchema>,
  config: MigrationConfig,
) {
  ...
}
```

now

```
export async function migrate<
 TSchema extends Record<string, unknown>,
 TRelations extends AnyRelations
>(
  db: NodePgDatabase<TSchema, TRelations>,
  config: MigrationConfig,
) {
  ...
}
```

**session**

before

```
export class NodePgSession<
  TFullSchema extends Record<string, unknown>,
  TSchema extends V1.TablesRelationalConfig,
> extends PgSession<NodePgQueryResultHKT, TFullSchema, TSchema>
```

now

```
export class NodePgSession<
  TFullSchema extends Record<string, unknown>,
  TRelations extends AnyRelations,
  TTablesConfig extends TablesRelationalConfig,
  TSchema extends V1.TablesRelationalConfig,
> extends PgSession<NodePgQueryResultHKT, TFullSchema, TRelations, TTablesConfig, TSchema>
```

**transaction**

before

```
export class NodePgTransaction<
  TFullSchema extends Record<string, unknown>,
  TSchema extends V1.TablesRelationalConfig,
> extends PgTransaction<NodePgQueryResultHKT, TFullSchema, TSchema>
```

now

```
export class NodePgTransaction<
  TFullSchema extends Record<string, unknown>,
  TRelations extends AnyRelations,
  TTablesConfig extends TablesRelationalConfig,
  TSchema extends V1.TablesRelationalConfig,
> extends PgTransaction<NodePgQueryResultHKT, TFullSchema, TRelations, TTablesConfig, TSchema>
```

**driver**

before

```
export class NodePgDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> extends PgDatabase<NodePgQueryResultHKT, TSchema>
```

now

```
export class NodePgDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> extends PgDatabase<NodePgQueryResultHKT, TSchema, TRelations>
```

2.  Updated `DrizzleConfig` generic with `TRelations` argument and `relations: TRelations` field

before

```
export interface DrizzleConfig<
  TSchema extends Record<string, unknown> = Record<string, never>
> {
  logger?: boolean | Logger;
  schema?: TSchema;
  casing?: Casing;
}
```

now

```
export interface DrizzleConfig<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> {
  logger?: boolean | Logger;
  schema?: TSchema;
  casing?: Casing;
  relations?: TRelations;
}
```

3.  The following entities have been moved from `drizzle-orm` and `drizzle-orm/relations` to `drizzle-orm/_relations`. The original imports now include new types used by Relational Queries v2, so make sure to update your imports if you intend to use the older types:

A list of all moved entities

- `Relation`
- `Relations`
- `One`
- `Many`
- `TableRelationsKeysOnly`
- `ExtractTableRelationsFromSchema`
- `ExtractObjectValues`
- `ExtractRelationsFromTableExtraConfigSchema`
- `getOperators`
- `Operators`
- `getOrderByOperators`
- `OrderByOperators`
- `FindTableByDBName`
- `DBQueryConfig`
- `TableRelationalConfig`
- `TablesRelationalConfig`
- `RelationalSchemaConfig`
- `ExtractTablesWithRelations`
- `ReturnTypeOrValue`
- `BuildRelationResult`
- `NonUndefinedKeysOnly`
- `BuildQueryResult`
- `RelationConfig`
- `extractTablesRelationalConfig`
- `relations`
- `createOne`
- `createMany`
- `NormalizedRelation`
- `normalizeRelation`
- `createTableRelationsHelpers`
- `TableRelationsHelpers`
- `BuildRelationalQueryResult`
- `mapRelationalRow`

4.  In the same manner, `${dialect}-core/query-builders/query` files were moved to `${dialect}-core/query-builders/_query` with RQB v2’s alternatives being put in their place

before

```
import { RelationalQueryBuilder, PgRelationalQuery } from './query-builders/query.ts';
```

now

```
import { _RelationalQueryBuilder, _PgRelationalQuery } from './query-builders/_query.ts';
```
