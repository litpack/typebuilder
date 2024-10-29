import { UserBuilder } from "./UserBuilder.js";

try {
  const user = UserBuilder()
    .setId("123e4567-e89b-12d3-a456-426614174000")
    .setName("Alice")
    .setAge(25)
    .setEmail("alice@example.com")
    .build();

  console.log("User created:", user);
} catch (error) {
  console.error("Validation error:", error);
}
