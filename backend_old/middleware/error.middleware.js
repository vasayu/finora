import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    return res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Internal Server Error",
    });
};

export default errorHandler;
