
const ERROR_MESSAGES = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "The data you provided is not valid. Please check your input.",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "You don't have permission to perform this action.",
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested resource was not found.",
  },
  ALREADY_EXISTS: {
    code: "ALREADY_EXISTS",
    message: "This resource already exists.",
  },
  INVALID_STATE: {
    code: "INVALID_STATE",
    message: "This operation cannot be performed in the current state.",
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred. Please try again.",
  },
};

const FIELD_SPECIFIC_MESSAGES = {
  email: "Please provide a valid email address",
  name: "Name is required and must be a text string",
  role: "Please select a valid role",
  department: "Please select a valid department",
  availabilityStatus: "Availability status must be available, unavailable, or on_leave",
  allocationPercentage: "Allocation percentage must be between 0 and 100",
  startDate: "Start date must be a valid timestamp",
  endDate: "End date must be a valid timestamp",
  proficiency: "Proficiency must be a number between 0 and 100",
  interestLevel: "Interest level must be a number between 0 and 100",
  description: "Description must be text",
  status: "Please select a valid status",
  lineManagerId: "Please select a valid line manager",
  employeeType: "Please select a valid employee type",
  weeklyHours: "Weekly hours must be a positive number",
  contractStartDate: "Contract start date must be valid",
  contractEndDate: "Contract end date must be valid",
  paymentTerms: "Payment terms must be valid",
  allocationPercentageValue: "Allocation percentage must be a valid number",
};

function parseValidationError(error) {
  const message = error.message || "";

  if (message.includes("contains extra field")) {
    const fieldMatch = message.match(/extra field `(\w+)`/);
    const fieldName = fieldMatch ? fieldMatch[1] : "unknown";
    return {
      code: "VALIDATION_ERROR",
      message: `The field "${fieldName}" is not expected for this operation. Please remove it and try again.`,
      field: fieldName,
    };
  }

  if (message.includes("missing required field")) {
    const fieldMatch = message.match(/missing required field `(\w+)`/);
    const fieldName = fieldMatch ? fieldMatch[1] : "unknown";
    return {
      code: "VALIDATION_ERROR",
      message: `${FIELD_SPECIFIC_MESSAGES[fieldName] || `The field "${fieldName}" is required`}`,
      field: fieldName,
    };
  }

  if (message.includes("Expected")) {
    const fieldMatch = message.match(/in the value of key `(\w+)`/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      return {
        code: "VALIDATION_ERROR",
        message: `${FIELD_SPECIFIC_MESSAGES[fieldName] || `The field "${fieldName}" has an invalid value`}`,
        field: fieldName,
      };
    }
  }

  return {
    code: "VALIDATION_ERROR",
    message: "The data you provided is not valid. Please check your input.",
  };
}

export function handleConvexError(error) {
  if (!error) {
    return {
      code: ERROR_MESSAGES.INTERNAL_ERROR.code,
      message: ERROR_MESSAGES.INTERNAL_ERROR.message,
    };
  }

  const message = error.message || "";

  if (message.includes("ArgumentValidationError")) {
    return parseValidationError(error);
  }

  if (message.includes("You don't have permission") || message.includes("Unauthorized")) {
    return {
      code: ERROR_MESSAGES.UNAUTHORIZED.code,
      message: ERROR_MESSAGES.UNAUTHORIZED.message,
    };
  }

  if (message.includes("not found")) {
    return {
      code: ERROR_MESSAGES.NOT_FOUND.code,
      message: ERROR_MESSAGES.NOT_FOUND.message,
    };
  }

  if (message.includes("already exists")) {
    return {
      code: ERROR_MESSAGES.ALREADY_EXISTS.code,
      message: ERROR_MESSAGES.ALREADY_EXISTS.message,
    };
  }

  if (message.includes("cannot be performed")) {
    return {
      code: ERROR_MESSAGES.INVALID_STATE.code,
      message: message,
    };
  }

  return {
    code: ERROR_MESSAGES.INTERNAL_ERROR.code,
    message: message || ERROR_MESSAGES.INTERNAL_ERROR.message,
  };
}
