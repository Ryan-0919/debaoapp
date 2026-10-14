declare module 'papaparse' {
  export interface ParseError {
    row?: number;
    message: string;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {fields?: string[]};
  }

  export interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    transformHeader?: (header: string) => string;
  }

  const Papa: {
    parse<T = Record<string, string>>(input: string, config?: ParseConfig): ParseResult<T>;
    unparse(data: Array<Record<string, unknown>> | unknown[][]): string;
  };

  export default Papa;
}
