// // src/types/express.d.ts
// import { IUser } from '../models/User';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: IUser;  // Adding user field to the Request interface
//     }
//   }
// }


// src/types/express.d.ts
import { IUser } from '../models/User'; // Adjust the path to your User model if necessary

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
