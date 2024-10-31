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
  private memo: Map<string, unknown> = new Map();

  constructor(private schema: T) {
    this.createSetters();
  }

  private createSetters(): void {
    const shape = this.schema.shape as Record<string, ZodTypeAny>;

    Object.keys(shape).forEach((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);

      if (!Object.prototype.hasOwnProperty.call(this, `set${capitalizedKey}`)) {
        Object.defineProperty(this, `set${capitalizedKey}`, {
          value: (value: z.infer<T["shape"][typeof key]>) => {
            if (this.memo.has(key)) return this;

            const result = shape[key].safeParse(value);
            if (!result.success) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  `Development validation warning for ${key}: ${result.error.message}`
                );
              } else {
                throw new Error(
                  `Validation error for ${key}: ${result.error.message}`
                );
              }
            }

            this.data[key as keyof T["shape"]] = value;
            this.memo.set(key, value);
            return this as unknown as Builder<T, UsedKeys | typeof key> & SetterMethods<T, UsedKeys | typeof key>;
          },
          writable: false,
          enumerable: false,
          configurable: true,
        });
      }
    });
  }

  public build(): z.infer<T> {
    return this.schema.parse(this.data);
  }
}

export function createBuilder<T extends ZodObject<any>>(
  schema: T
): Builder<T> & SetterMethods<T> {
  const builder = new Builder(schema);
  return builder as Builder<T> & SetterMethods<T>;
}
