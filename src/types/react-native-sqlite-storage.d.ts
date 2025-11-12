declare module 'react-native-sqlite-storage' {
  export interface DatabaseParams {
    name: string;
    location?: string;
  }

  export interface ResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (index: number) => any;
      raw: () => any[];
    };
  }

  export interface Transaction {
    executeSql: (
      sql: string,
      params?: any[],
      success?: (tx: Transaction, results: ResultSet) => void,
      error?: (tx: Transaction, error: Error) => void,
    ) => void;
  }

  export interface SQLiteDatabase {
    transaction: (
      fn: (tx: Transaction) => void,
      error?: (error: Error) => void,
      success?: () => void,
    ) => void;
    executeSql: (
      sql: string,
      params?: any[],
    ) => Promise<[ResultSet]>;
    close: () => Promise<void>;
  }

  export function openDatabase(
    params: DatabaseParams,
  ): Promise<SQLiteDatabase>;

  export function enablePromise(enable: boolean): void;

  const SQLite: {
    openDatabase: typeof openDatabase;
    enablePromise: typeof enablePromise;
  };

  export default SQLite;
}
