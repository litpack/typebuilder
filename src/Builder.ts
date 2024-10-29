import { z, ZodObject } from "zod";

type SetterMethods<T extends ZodObject<any>> = {
  [K in keyof T["shape"] & string as `set${Capitalize<K>}`]: (value: z.infer<T>["shape"][K]) => Builder<T> & SetterMethods<T>;
} & {
  build(): z.infer<T>;
};

export class Builder<T extends ZodObject<any>> {
  private data: Partial<z.infer<T>> = {};

  constructor(private schema: T) {
    this.createSetters();
  }

  private createSetters(): void {
    Object.keys(this.schema.shape).forEach((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      Object.defineProperty(this, `set${capitalizedKey}`, {
        value(value: any) {
          this.data[key as keyof T["shape"]] = value;
          return this;
        },
        writable: false,
        enumerable: false,
        configurable: true,
      });
    });
  }

  public build(): z.infer<T> {
    return this.schema.parse(this.data);
  }
}

export function createBuilder<T extends ZodObject<any>>(schema: T): Builder<T> & SetterMethods<T> {
  const builder = new Builder(schema);
  return builder as Builder<T> & SetterMethods<T>;
}
