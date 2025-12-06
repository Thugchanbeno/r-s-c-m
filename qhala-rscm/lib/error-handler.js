export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  INVALID_STATE: "INVALID_STATE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
};

export function parseError(error) {
  if (!error) {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "An unexpected error occurred. Please try again.",
      field: null,
    };
  }

  if (error.response?.ok === false) {
    const data = error.response?.data;
    if (data?.error) {
      return {
        code: data.code || ERROR_CODES.INTERNAL_ERROR,
        message: data.error,
        field: data.field || null,
        status: error.response?.status,
      };
    }
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: "Network error. Please check your connection and try again.",
    };
  }

  if (typeof error === "string") {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error,
    };
  }

  if (error.message) {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
    };
  }

  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "An unexpected error occurred. Please try again.",
  };
}

export function getErrorMessage(error) {
  const parsed = parseError(error);
  return parsed.message;
}

export function getFieldError(error) {
  const parsed = parseError(error);
  return parsed.field;
}

export function isValidationError(error) {
  const parsed = parseError(error);
  return parsed.code === ERROR_CODES.VALIDATION_ERROR;
}

export function isUnauthorizedError(error) {
  const parsed = parseError(error);
  return parsed.code === ERROR_CODES.UNAUTHORIZED;
}

export function isNotFoundError(error) {
  const parsed = parseError(error);
  return parsed.code === ERROR_CODES.NOT_FOUND;
}

export function formatErrorForDisplay(error) {
  const parsed = parseError(error);
  return {
    title: getErrorTitle(parsed.code),
    message: parsed.message,
    code: parsed.code,
  };
}

function getErrorTitle(code) {
  const titles = {
    [ERROR_CODES.VALIDATION_ERROR]: "Invalid Input",
    [ERROR_CODES.UNAUTHORIZED]: "Access Denied",
    [ERROR_CODES.NOT_FOUND]: "Not Found",
    [ERROR_CODES.ALREADY_EXISTS]: "Already Exists",
    [ERROR_CODES.INVALID_STATE]: "Invalid Operation",
    [ERROR_CODES.NETWORK_ERROR]: "Connection Error",
    [ERROR_CODES.INTERNAL_ERROR]: "Error",
  };
  return titles[code] || "Error";
}
