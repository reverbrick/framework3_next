"use client";

import { Main } from "@/components/layout/main";
import { DynamicForm } from "@/components/dynamic-form";
import type { FieldConfig, UISchema } from "@/lib/definitions";
import formConfig from "./form-config.json";

const fields = formConfig.fields as FieldConfig[];
const userFormUISchema = formConfig.uiSchema as UISchema;

export default function Page() {
  return (
    <>
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {formConfig.name}
            </h2>
            <p className="text-muted-foreground">
              {formConfig.description}
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DynamicForm
            fields={fields}
            uiSchema={userFormUISchema}
            submitLabel="Create Account"
            successRedirect="/dashboard"
          />
        </div>
      </Main>
    </>
  );
}
