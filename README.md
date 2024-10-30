```markdown
# TypeBuilder

TypeBuilder is a TypeScript-based library that implements the Builder design pattern, allowing for easy and flexible object creation with built-in validation using [Zod](https://github.com/colinhacks/zod). This library is useful for managing complex object configurations while ensuring that all properties meet specified validation criteria.

## Features

- **Builder Pattern**: Create complex objects step-by-step.
- **Validation**: Automatically validate properties using Zod schemas.
- **Type Safety**: Leverage TypeScript for type-safe code.
- **Flexibility**: Easily extendable to support new object types and schemas.

## Installation

To install TypeBuilder, use npm:

npm install @mehrabi/typebuilder
```

Or, if you prefer yarn:

```bash
yarn add @mehrabi/typebuilder
```

## Usage

### Creating a Builder

To create a new object using TypeBuilder, first define a Zod schema for the object:

```typescript
import { z } from "zod";
import { createBuilder } from "typebuilder";

// Define your Zod schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
});

// Create a UserBuilder using the schema
const UserBuilder = createBuilder(UserSchema);
```

### Building an Object

You can now use the builder to create a validated object:

```typescript
try {
  const user = UserBuilder
    .setId("123e4567-e89b-12d3-a456-426614174000")
    .setName("Alice")
    .setAge(25)
    .setEmail("alice@example.com")
    .build();

  console.log("User created:", user);
} catch (error) {
  console.error("Validation error:", error);
}
```

### Available Methods

The `UserBuilder` automatically provides setter methods based on the Zod schema:

- `setId(value: string)`
- `setName(value: string)`
- `setAge(value: number)`
- `setEmail(value: string)`

### Example

Here’s a complete example of using TypeBuilder with a simple User object:

```typescript
import { z } from "zod";
import { createBuilder } from "@mehrabi/typebuilder";

// Define the User schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
});

// Create a UserBuilder
const UserBuilder = createBuilder(UserSchema);

// Build a User object
try {
  const user = UserBuilder
    .setId("123e4567-e89b-12d3-a456-426614174000")
    .setName("Alice")
    .setAge(25)
    .setEmail("alice@example.com")
    .build();

  console.log("User created:", user);
} catch (error) {
  console.error("Validation error:", error);
}
```

## API Reference

- `createBuilder(schema: ZodSchema)`: Function to create a builder based on the provided Zod schema.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Aaron Mehrabi

## Acknowledgments

- [Zod](https://github.com/colinhacks/zod) for providing a powerful validation library.
- [TypeScript](https://www.typescriptlang.org/) for enhancing JavaScript with static types.
