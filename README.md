## Hint

```ts
// src/typings/fseventdispatcher.d.ts

import 'fseventdispatcher';

declare module "fseventdispatcher" {
  interface FSEventMediator {
    test: (id: string) => boolean;
  }
} 
```