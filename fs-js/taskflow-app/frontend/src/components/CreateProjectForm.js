import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

export default function CreateProjectForm({ onCreate }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  const submit = async (data) => {
    await onCreate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: 8, marginTop: 12 }}>
      <h4 style={{ margin: 0 }}>Create project</h4>
      <input placeholder="Name" {...register("name")} />
      {errors.name && <small>{errors.name.message}</small>}
      <input placeholder="Description (optional)" {...register("description")} />
      <button disabled={isSubmitting} type="submit">Create</button>
    </form>
  );
}
