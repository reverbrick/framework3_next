/**
 * Represents a customer in the system
 */
export interface Customer {
  /** Unique index of the customer */
  Index: number;
  /** Unique identifier for the customer */
  "Customer Id": string | null;
  /** Customer's first name */
  "First Name": string | null;
  /** Customer's last name */
  "Last Name": string | null;
  /** Customer's email address */
  Email: string | null;
  /** Customer's company name */
  Company: string | null;
  /** Customer's city */
  City: string | null;
  /** Customer's country */
  Country: string | null;
  /** Customer's primary phone number */
  "Phone 1": string | null;
  /** Customer's secondary phone number */
  "Phone 2": string | null;
  /** Customer's website URL */
  Website: string | null;
  /** Date when the customer subscribed */
  "Subscription Date": string | null;
}

/**
 * Type guard to check if an object is a Customer
 */
export function isCustomer(obj: unknown): obj is Customer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'Index' in obj &&
    'Customer Id' in obj &&
    'First Name' in obj &&
    'Last Name' in obj &&
    'Email' in obj &&
    'Company' in obj &&
    'City' in obj &&
    'Country' in obj &&
    'Phone 1' in obj &&
    'Phone 2' in obj &&
    'Website' in obj &&
    'Subscription Date' in obj
  );
} 