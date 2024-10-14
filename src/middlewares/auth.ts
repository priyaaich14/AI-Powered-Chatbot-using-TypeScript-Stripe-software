
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { Socket } from 'socket.io';



// export interface IAuthRequest extends Request {
//   user?: any;  // Use a more specific type if needed
// }

// export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Access denied' });

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    
//     // Attach the verified user ID and role to req.user
//     req.user = {id: verified.id, role: verified.role };

//     next();  // Proceed to the next middleware/controller
//   } catch (error) {
//     res.status(400).json({ message: 'Invalid token' });
//   }
// };

// // For WebSocket connections:
// export const authenticateTokenWebSocket = (socket: Socket, next: (err?: any) => void) => {
//   const token = socket.handshake.auth?.token;
//   if (!token) return next(new Error('Authentication error: Token is required'));

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string };
//     (socket as any).user = { _id: verified._id, role: verified.role };  // Attach user details to socket
//     next(); // Call next() if the token is valid
//   } catch (error) {
//     next(new Error('Authentication error: Invalid token'));
//   }
// };
// // Role-based access control middleware
// export const authorizeRoles = (roles: string[]) => {
//   return (req: IAuthRequest, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     next();
//   };
// };



import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Import your User model
import { IUser } from '../models/User'; // Import your IUser interface
import { Socket } from 'socket.io';

export interface IAuthRequest extends Request {
  user?: IUser;  // IUser contains the full user information including role
}

export const authenticateToken = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    // Verify token to extract the user ID and role
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

    // Retrieve the full user data by ID from the database
    const user = await User.findById(verified.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify that the role in the token matches the role in the database
    if (user.role !== verified.role) {
      return res.status(403).json({ message: 'Role mismatch' });
    }

    // Attach the full user object to req.user
    req.user = user;

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

export const authenticateTokenWebSocket = async (socket: Socket, next: (err?: any) => void) => {
  const token = socket.handshake.auth?.token; // Get token from WebSocket handshake auth

  if (!token) {
    return next(new Error('Authentication error: Token is required'));
  }

  try {
    // Verify token to extract the user ID and role
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string };

    // Retrieve the full user data by ID from the database
    const user = await User.findById(verified._id);

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Verify that the role in the token matches the role in the database
    if (user.role !== verified.role) {
      return next(new Error('Authentication error: Role mismatch'));
    }

    // Attach the full user object to socket.user
    (socket as any).user = user;

    // Call next() if the token is valid and the user and role are verified
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Check if the user is logged in and if the user's role matches one of the required roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // If role matches, proceed to the next middleware/controller
    next();
  };
};
