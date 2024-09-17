
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type with a custom interface that includes the user property
export interface IAuthRequest extends Request {
  user?: any; // You can replace 'any' with a more specific type if you have one (e.g., IUser)
}

// Authenticate JWT token middleware
export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = verified;  // Attach the decoded token (which contains user info) to req.user
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Role-based access control middleware
export const authorizeRoles = (roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
