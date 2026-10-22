import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated.", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User account no longer exists.", 401));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorHandler("Session expired or invalid token.", 401));
  }
});

export const optionalAuth = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // Ignored for optional auth
    }
  }
  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role ${req.user?.role || "Guest"} is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};