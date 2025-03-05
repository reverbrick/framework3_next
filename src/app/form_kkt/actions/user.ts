"use server";

import { UserFormSchema, type FormState } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function createUser(prevState: FormState, formData: FormData) {
  // Validate form fields using the schema
  const validatedFields = UserFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
    };
  }

  // Get the validated data
  const { name, email, password } = validatedFields.data;

  try {
    // Here you would typically:
    // 1. Hash the password
    // 2. Store the user in your database
    // 3. Create a session, etc.

    // For demo purposes, we'll just simulate a successful creation
    console.log("User created:", { name, email });

    // Redirect to success page after successful submission
    redirect("/dashboard");
  } catch (error) {
    // Handle any errors that occur during user creation
    return {
      message: "Failed to create user. Please try again.",
    };
  }
}
