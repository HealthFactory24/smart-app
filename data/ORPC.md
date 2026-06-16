Your current implementation mixes **tRPC-style patterns** with **oRPC TanStack Query utils**, and a few typings are incorrect.

Main problems:

* `orpcClient.useQuery` does not exist
* `queryOptions` typing is invalid
* generic hooks are unnecessary and unsafe
* `useMutation(mutationFn)` is not how oRPC works
* provider context should expose stable typed utilities only

Here’s the corrected and production-grade version.

```tsx id="h6x6qy"
'use client';

import {
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import {
  createContext,
  useContext,
  useMemo,
} from 'react';

import {
  client,
  orpc,
  queryClient,
} from '@/orpc/client';

type ORPCContextValue = {
  client: typeof client;
  orpc: typeof orpc;
};

const ORPCContext = createContext<ORPCContextValue | null>(null);

interface ORPCProviderProps {
  children: React.ReactNode;
}

export function ORPCProvider({
  children,
}: ORPCProviderProps) {
  const value = useMemo(
    () => ({
      client,
      orpc,
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ORPCContext.Provider value={value}>
        {children}

        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </ORPCContext.Provider>
    </QueryClientProvider>
  );
}

export function useORPC() {
  const context = useContext(ORPCContext);

  if (!context) {
    throw new Error(
      'useORPC must be used within ORPCProvider'
    );
  }

  return context;
}
```

---

# ✅ Correct way to use oRPC in components

Your previous custom hooks are not needed.

With `createTanstackQueryUtils(client)`, you should use:

```tsx id="v4ep4r"
const { orpc } = useORPC();

const patientsQuery = useQuery(
  orpc.patient.list.queryOptions({
    input: {
      page: 1,
      limit: 10,
    },
  })
);
```

Mutation:

```tsx id="76zx40"
const { orpc } = useORPC();

const createPatientMutation = useMutation(
  orpc.patient.create.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        orpc.patient.list.pathFilter()
      );
    },
  })
);
```

---

# 🔥 Important architectural correction

You were trying to build:

```tsx
useORPCQuery()
useORPCMutation()
```

But with oRPC + TanStack Query:

* procedures already generate typed query/mutation options
* wrapping them removes type inference
* generic wrappers actually weaken safety

So the best architecture is:

* expose `orpc`
* consume directly with `useQuery` / `useMutation`

Exactly like:

```tsx id="x7kqj2"
useQuery(orpc.patient.byId.queryOptions({...}))
```

This preserves:

* autocomplete
* inference
* input/output validation
* route safety

---

# ✅ Recommended folder structure

```id="v0s3tr"
src/
 ├── orpc/
 │    ├── client.ts
 │    ├── provider.tsx
 │    └── hooks/
 │         └── patients.ts
```

---

# Example feature hook (BEST PRACTICE)

```tsx id="l6c6ak"
import { useQuery } from '@tanstack/react-query';

import { useORPC } from '@/components/orpc-provider';

export function usePatients(page = 1) {
  const { orpc } = useORPC();

  return useQuery(
    orpc.patient.list.queryOptions({
      input: {
        page,
        limit: 10,
      },
    })
  );
}
```

This is the scalable architecture you want for your pediatric clinic app.
