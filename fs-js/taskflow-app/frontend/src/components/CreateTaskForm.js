import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional()
});

export default function CreateTaskForm({ projectId, onCreate }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: zodResolver(schema) });

  const submit = async (data) => {
    await onCreate({
      projectId,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      dueDate: data.dueDate ? data.dueDate : null
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: 8 }}>
      <h4 style={{ margin: 0 }}>Create task</h4>
      <input placeholder="Title" {...register("title")} />
      {errors.title && <small>{errors.title.message}</small>}

      <input placeholder="Description (optional)" {...register("description")} />

      <select {...register("priority")}>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
      </select>

      <input type="date" {...register("dueDate")} />

      <button disabled={isSubmitting} type="submit">Create</button>
    </form>
  );
}
