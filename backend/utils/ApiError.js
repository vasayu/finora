class ApiError extends Error {
	constructor(statusCode, message, error = [], stack = "") {
		super(message);
		this.statusCode = statusCode;
		this.data = null;
		this.message = message;
		this.success = false;
		this.error = error;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
	toJSON() {
		return {
			statusCode: this.statusCode,
			data: this.data,
			success: this.success,
			error: this.error,
			message: this.message,
		};
	}
}

export { ApiError };
