/**
 * Content lives in data/*.json so the admin at admin.hgsportafolio.site can edit it. JSON loses literal types
 * ("intro" becomes string, a tuple becomes an array), so `checked` compares the file against a widened copy of the
 * real type: a missing or misspelled key still fails `tsc`, and therefore the build, before anything is published.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { [K in keyof T]: Widen<T[K]> }
          : T;

export const checked = <T>(value: Widen<T>): T => value as unknown as T;
