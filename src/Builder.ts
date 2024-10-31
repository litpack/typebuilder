import { z, ZodObject, ZodTypeAny } from "zod";

type SetterMethods<T extends ZodObject<any>, UsedKeys extends keyof T["shape"] = never> = {
  [K in keyof T["shape"] & string as K extends UsedKeys ? never : `set${Capitalize<K>}`]: (
    value: z.infer<T["shape"][K]>
  ) => Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
} & {
  build(): z.infer<T>;
};

export class Builder<T extends ZodObject<any>, UsedKeys extends keyof T["shape"] = never> {
  private data: Partial<z.infer<T>> = {};
  private memo: Set<string> = new Set();
  private schemaShape: Record<string, ZodTypeAny>;

  constructor(private readonly schema: T) {
    this.schemaShape = schema.shape as Record<string, ZodTypeAny>;
    this.createSetters();
  }

  private createSetters(): void {
    for (const key in this.schemaShape) {
      const capitalizedKey = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
      if (!Object.prototype.hasOwnProperty.call(this, capitalizedKey)) {
        Object.defineProperty(this, capitalizedKey, {
          value: (value: z.infer<T["shape"][typeof key]>) => this.setField(key, value),
          writable: false,
          enumerable: false,
          configurable: true,
        });
      }
    }
  }

  private setField<K extends keyof T["shape"] & string>(key: K, value: z.infer<T["shape"][K]>) {
    if (this.memo.has(key)) return this;

    const validationResult = this.schemaShape[key].safeParse(value);
    if (!validationResult.success) {
      const errorMessage = `Validation error for ${key}: ${validationResult.error.message}`;
      if (process.env.NODE_ENV === "development") console.warn(`Development validation warning: ${errorMessage}`);
      else throw new Error(errorMessage);
    }

    this.data[key] = value;
    this.memo.add(key);
    return this as unknown as Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
  }

  public build(): z.infer<T> {
    return this.schema.parse(this.data);
  }
}

export function createBuilder<T extends ZodObject<any>>(
  schema: T
): Builder<T> & SetterMethods<T> {
  return new Builder(schema) as Builder<T> & SetterMethods<T>;
}
