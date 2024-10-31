import { z, ZodObject } from "zod";

type SetterMethods<T extends ZodObject<any>, UsedKeys extends keyof T["shape"] = never> = {
  [K in keyof T["shape"] & string as K extends UsedKeys ? never : `set${Capitalize<K>}`]: (
    value: z.infer<T["shape"][K]>
  ) => Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
} & {
  build(): z.infer<T>;
};

export class Builder<T extends ZodObject<any>, UsedKeys extends keyof T["shape"] = never> {
  private data: Partial<z.infer<T>> = {};
  private validationCache: Map<keyof T["shape"], { value: any; success: boolean; error?: string }> = new Map();

  constructor(private readonly schema: T) {}

  public setField<K extends keyof T["shape"]>(key: K, value: z.infer<T["shape"][K]>): Builder<T, UsedKeys | K> {
    const shape = this.schema.shape;

    const cached = this.validationCache.get(key);
    if (cached && cached.value === value) {
      if (!cached.success) {
        throw new Error(`Validation error for ${String(key)}: ${cached.error}`);
      }
      this.data[key] = value;
      return this as unknown as Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
    }

    const validationResult = shape[key].safeParse(value);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.message;
      if (process.env.NODE_ENV === "development") {
        console.warn(`Development validation warning: Validation error for ${String(key)}: ${errorMessage}`);
      } else {
        throw new Error(`Validation error for ${String(key)}: ${errorMessage}`);
      }
      
      this.validationCache.set(key, { value, success: false, error: errorMessage });
      return this as unknown as Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
    }

    this.validationCache.set(key, { value, success: true });
    this.data[key] = value;
    return this as unknown as Builder<T, UsedKeys | K> & SetterMethods<T, UsedKeys | K>;
  }

  public build(): z.infer<T> {
    return this.schema.parse(this.data);
  }
}

export function createBuilder<T extends ZodObject<any>>(schema: T): Builder<T> & SetterMethods<T> {
  const builder = new Builder(schema);

  for (const key of Object.keys(schema.shape)) {
    const methodName = `set${key.charAt(0).toUpperCase() + key.slice(1)}` as const;
    
    (builder as any)[methodName] = (value: unknown) => builder.setField(key as keyof T["shape"], value);
  }

  return builder as Builder<T> & SetterMethods<T>;
}
