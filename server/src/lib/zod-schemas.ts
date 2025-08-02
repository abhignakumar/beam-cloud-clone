import z from "zod";

export const FunctionRequestSchema = z.object({
  language: z.literal(["javascript", "python"]),
  code: z.string(),
  functionName: z.string(),
  args: z.array(z.any()),
});

export const PodRequestSchema = z.object({
  image: z.string(),
  ports: z.array(z.int().positive()),
});
