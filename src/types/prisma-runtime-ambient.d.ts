// Ambient declarations to avoid cross-package inferred-type issues with Prisma runtime
// This file intentionally provides a lightweight `any`-based module shape for the
// runtime modules that Prisma's generated files import. It is non-invasive and
// does not modify any generated files. It only provides TypeScript declarations
// so the compiler does not attempt to expand complex inferred types that come
// from different package instances.

declare module "@prisma/client/runtime/client" {
  const runtime: any;
  export = runtime;
}

declare module "@prisma/client/runtime/index-browser" {
  const runtime: any;
  export = runtime;
}
