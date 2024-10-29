import { z } from "zod";
import { createBuilder } from "./Builder.js";

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  age: z.number().min(18),
  email: z.string().email(),
});

export const UserBuilder = () => createBuilder(userSchema);
