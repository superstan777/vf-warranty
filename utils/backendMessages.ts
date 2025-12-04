export const backendMessages = {
  MISSING_FIELDS: "Invalid data – missing user or message content.",
  CHECK_FAILED:
    "An error occurred while checking for an existing pending note.",
  PENDING_ALREADY_EXISTS:
    'You already have an active pending note. Please provide the incident number or type "cancel" to abort.',
  PENDING_INSERT_FAILED: "Failed to add pending note. Please try again later.",
  PENDING_ADDED:
    'Pending note added successfully. Please provide the incident number or type "cancel" to abort.',
  UNHANDLED_EXCEPTION:
    "An unhandled server error occurred. Please try again later.",
};

export type BackendErrorReason =
  | "MISSING_FIELDS"
  | "CHECK_FAILED"
  | "PENDING_INSERT_FAILED"
  | "UNHANDLED_EXCEPTION";
