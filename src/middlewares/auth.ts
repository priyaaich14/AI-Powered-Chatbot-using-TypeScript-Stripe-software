
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';


export interface IAuthRequest extends Request {
  user?: any;  // Use a more specific type if needed
}

export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
  console.log('Authenticate middleware hit');  // Add this log to ensure middleware is called
  const token = req.header('Authorization')?.split(' ')[1];
  console.log('No token provided');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };;
    //req.user = verified;
    req.user = { _id: verified.id, role: verified.role }; 
    // Log to ensure that the token is parsed and user data is set correctly
    console.log('Verified user in middleware:', req.user);

    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// For WebSocket connections:
export const authenticateTokenWebSocket = (socket: Socket, next: (err?: any) => void) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication error: Token is required'));

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string };
    (socket as any).user = { _id: verified._id, role: verified.role };  // Attach user details to socket
    next(); // Call next() if the token is valid
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
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


