"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { DynamicForm } from "@/components/dynamic-form";
import type { FieldConfig, UISchema } from "@/lib/definitions";

const userFormFields: FieldConfig[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    validations: [
      { min: 2, message: "Name must be at least 2 characters long" },
    ],
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    validations: [
      { min: 8, message: "Password must be at least 8 characters long" },
      {
        pattern:
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        message:
          "Password must contain at least one letter, one number, and one special character",
      },
    ],
  },
  {
    name: "bio",
    label: "Bio",
    type: "text",
    required: false,
  },
  {
    name: "role",
    label: "Role",
    type: "text",
    required: true,
  },
  {
    name: "experience",
    label: "Years of Experience",
    type: "number",
    required: true,
  },
  {
    name: "terms",
    label: "Terms and Conditions",
    type: "text",
    required: true,
  },
  {
    name: "newsletter",
    label: "Newsletter",
    type: "text",
    required: false,
  },
];

const userFormUISchema: UISchema = {
  personalInfo: {
    uiType: "namedGroup",
    name: "personalInfo",
    label: "Personal Information",
    fields: ["name", "email", "password"],
    layout: "vertical",
  },
  name: {
    uiType: "text",
    placeholder: "John Doe",
    helperText: "Enter your full name as it appears on official documents.",
  },
  email: {
    uiType: "email",
    placeholder: "john@example.com",
    helperText: "We'll never share your email with anyone else.",
  },
  password: {
    uiType: "password",
    helperText:
      "Password must be at least 8 characters long and include a mix of letters, numbers, and special characters.",
  },
  spacer1: {
    uiType: "spacer",
    height: "1rem",
  },
  profileInfo: {
    uiType: "namedGroup",
    name: "profileInfo",
    label: "Profile Information",
    fields: ["bio", "roleAndExperience"],
    layout: "vertical",
  },
  bio: {
    uiType: "textarea",
    rows: 4,
    placeholder: "Tell us a little about yourself...",
    helperText:
      "Optional: Share your interests, hobbies, or anything else you'd like us to know.",
  },
  roleAndExperience: {
    uiType: "group",
    layout: "horizontal",
    fields: ["role", "experience"],
    className: "items-start",
  },
  role: {
    uiType: "select",
    options: [
      { label: "Developer", value: "developer" },
      { label: "Designer", value: "designer" },
      { label: "Manager", value: "manager" },
      { label: "Other", value: "other" },
    ],
    helperText: "Select the role that best describes your position.",
  },
  experience: {
    uiType: "number",
    placeholder: "0",
    helperText: "Enter the number of years of experience you have.",
  },
  spacer2: {
    uiType: "spacer",
    height: "2rem",
  },
  preferences: {
    uiType: "namedGroup",
    name: "preferences",
    label: "Preferences",
    fields: ["newsletter", "terms"],
    layout: "vertical",
  },
  newsletter: {
    uiType: "checkbox",
    options: [{ label: "Subscribe to our newsletter", value: "subscribed" }],
    helperText: "Get the latest updates and news.",
  },
  terms: {
    uiType: "checkbox",
    options: [
      { label: "I agree to the Terms and Conditions", value: "agreed" },
    ],
    helperText:
      "You must agree to our Terms and Conditions to create an account.",
  },
};

export default function Page() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">The form</h2>
            <p className="text-muted-foreground">
              Manage your users and their roles here.
            </p>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DynamicForm
            fields={userFormFields}
            uiSchema={userFormUISchema}
            submitLabel="Create Account"
            successRedirect="/dashboard"
          />
        </div>
      </Main>
    </>
  );
}
