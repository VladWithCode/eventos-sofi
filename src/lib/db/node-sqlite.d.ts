// The installed @types/node (v20) predates `node:sqlite`. This covers only the
// subset the app uses; delete it once @types/node is upgraded to >= 22.
declare module "node:sqlite" {
  type SQLInputValue = null | number | bigint | string | Uint8Array;
  type SQLOutputValue = null | number | bigint | string | Uint8Array;
  type NamedParameters = Record<string, SQLInputValue>;

  interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  interface StatementSync {
    run(...params: Array<SQLInputValue | NamedParameters>): StatementResultingChanges;
    get(...params: Array<SQLInputValue | NamedParameters>): Record<string, SQLOutputValue> | undefined;
    all(...params: Array<SQLInputValue | NamedParameters>): Array<Record<string, SQLOutputValue>>;
  }

  interface DatabaseSyncOptions {
    open?: boolean;
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
    timeout?: number;
  }

  class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
    readonly isTransaction: boolean;
  }
}
