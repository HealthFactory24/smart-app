## Install

Add the Sentry TanStack Start SDK as a dependency using `npm`, `yarn` or `pnpm`:

```bash
npm install --save @sentry/tanstackstart-react
```

## Set up the SDK

In the following steps we will set up the SDK and instrument various parts of your application.

First, initialize Sentry on the client in your `src/router.tsx` file:javascript-tanstackstart-react

```typescript
// src/router.tsx
import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from '@tanstack/react-router'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter();

  if (!router.isServer) {
    Sentry.init({
      dsn: "https://12ac9bd1cc7d2b1fc1dd6284984d591e@o4511516370403328.ingest.de.sentry.io/4511516381872208",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
      sendDefaultPii: true,
    });
  }

  return router;
}
```

Create an instrument file `instrument.server.mjs` in the root your project. In this file, initialize the Sentry SDK for your server:

```tsx
// instrument.server.mjs
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: "https://12ac9bd1cc7d2b1fc1dd6284984d591e@o4511516370403328.ingest.de.sentry.io/4511516381872208",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
```

> **Warning:** If you can't use the `--import` flag (e.g. in serverless environments like Vercel or Netlify), follow the [TanStack Start React guide](https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/#without---import-flag-eg-vercel-netlify) for alternative setup instructions.

To capture server-side errors and traces, explicitly define a [server entry point](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point) in your application and wrap your request handler with `wrapFetchWithSentry`.

Create a `src/server.ts` file in your project:

```typescript
// src/server.ts
import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry(
  wrapFetchWithSentry({
    fetch(request: Request) {
      return handler.fetch(request);
    },
  })
);
```

Add the `sentryTanstackStart` Vite plugin to your `vite.config.ts` file:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    sentryTanstackStart({
      org: "smart-clinic-1c",
      project: "prisma-tanstack",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

For production monitoring, you need to move the Sentry server config file to your build output. Since [TanStack Start is designed to work with any hosting provider](https://tanstack.com/start/latest/docs/framework/react/guide/hosting), the exact location will depend on where your build artifacts are deployed (for example, `/dist`, `.output/server` or a platform-specific directory).

For example, when using [Nitro](https://nitro.build/), copy the instrumentation file to `.output/server`:

```json
// package.json
{
  "scripts": {
     "build": "vite build && cp instrument.server.mjs .output/server",
  }
}
```

Add a `--import` flag directly or to the `NODE_OPTIONS` environment variable wherever you run your application to import `instrument.server.mjs`:

```json
// package.json
{
  "scripts": {
     "build": "vite build && cp instrument.server.mjs .output/server",
     "dev": "NODE_OPTIONS='--import ./instrument.server.mjs' vite dev --port 3000",
     "start": "node --import ./.output/server/instrument.server.mjs .output/server/index.mjs",
  }
}
```

To capture server-side errors from HTTP requests and server function invocations, add Sentry's global middlewares to `createStart()` in your `src/start.ts` file:

```typescript
// src/start.ts
import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [sentryGlobalRequestMiddleware],
    functionMiddleware: [sentryGlobalFunctionMiddleware],
  };
});
```

> **Note:** The Sentry middleware should be the first middleware in the arrays to ensure all errors are captured. SSR rendering exceptions are not captured by the middleware. Use captureException to manually capture those errors.

Errors caught by your own error boundaries aren't captured unless you report them manually. Wrap your custom `ErrorBoundary` component with `withErrorBoundary`:

```tsx
import React from "react";
import * as Sentry from "@sentry/tanstackstart-react";

class MyErrorBoundary extends React.Component {
  // ...
}

export const MySentryWrappedErrorBoundary = withErrorBoundary(
  MyErrorBoundary,
  {
    // ... sentry error wrapper options
  },
);
```

If you defined `errorComponents` in your Code-Based TanStack Router routes, capture the `error` argument with `captureException` inside a `useEffect` hook:

```tsx
import { createRoute } from "@tanstack/react-router";
import * as Sentry from "@sentry/tanstackstart-react";

const route = createRoute({
  errorComponent: ({ error }) => {
    useEffect(() => {
      Sentry.captureException(error)
    }, [error])

    return (
      // ...
    )
  }
})
```

## Upload Source Maps (Optional)

If you configured the `sentryTanstackStart` Vite plugin as shown above, source maps will be automatically uploaded to Sentry during the build process and deleted from your build output afterwards.

For alternative source map upload methods, follow the [Vite source maps guide](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/).

## Avoid Ad Blockers With Tunneling (Optional)

You can prevent ad blockers from blocking Sentry events using tunneling. Use the `tunnel` option to add an API endpoint in your application that forwards Sentry events to Sentry servers.

To enable tunneling, update `Sentry.init` with the following option:

```tsx
Sentry.init({
  dsn: "https://12ac9bd1cc7d2b1fc1dd6284984d591e@o4511516370403328.ingest.de.sentry.io/4511516381872208",
  tunnel: '/tunnel',
});
```

## Verify

Let's test your setup and confirm that Sentry is working correctly and sending data to your Sentry project.

To verify that Sentry captures errors and creates issues in your Sentry project, add a test button to one of your pages, which will trigger an error that Sentry will capture when you click it:

```tsx
<button
  type="button"
  onClick={() => {
    throw new Error("Sentry Test Error");
  }}
>
  Break the world
</button>

```

Open the page in a browser and click the button to trigger a frontend error.

Now view the collected data in your issues feed (it takes a couple of moments for the data to appear).
