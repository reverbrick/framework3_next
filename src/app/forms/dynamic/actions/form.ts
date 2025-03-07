"use server";

import {
  createDynamicSchema,
  type FieldConfig,
  type FormState,
} from "@/lib/definitions";

export async function processForm(
  fields: FieldConfig[],
  prevState: FormState,
  formData: FormData,
) {
  // Create a dynamic schema based on the field configurations
  const dynamicSchema = createDynamicSchema(fields);

  // Extract form data into an object
  const formValues: Record<string, any> = {};
  fields.forEach((field) => {
    formValues[field.name] = formData.get(field.name);
  });

  // Validate form data
  const validationResult = dynamicSchema.safeParse(formValues);

  // If validation fails, return errors
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      success: false,
    };
  }

  try {
    // Process the validated data
    // This is where you would typically save to a database
    console.log("Form data processed:", validationResult.data);

    // Return success state with the processed data
    return {
      message: "Form submitted successfully!",
      success: true,
      data: validationResult.data,
    };

    // Alternatively, you could redirect
    // redirect('/success')
  } catch (error) {
    return {
      message: "An error occurred while processing your form.",
      success: false,
    };
  }
} 