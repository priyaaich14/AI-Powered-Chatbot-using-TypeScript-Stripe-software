// import React, { useEffect, useState } from 'react';
// import { promoteToTechnician, deleteAccountByAdmin, getAllUsers } from '../../services/authService.ts';
// import { toast } from 'react-toastify';

// // Define the User interface
// interface User {
//   _id: string;
//   name: string;
//   role: string;
// }

// const AdminDashboard: React.FC = () => {
//   // Define users as an array of User objects
//   const [users, setUsers] = useState<User[]>([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const { data } = await getAllUsers();
//         setUsers(data); // TypeScript now knows that data is an array of User objects
//       } catch (error) {
//         toast.error('Error fetching users');
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handlePromote = async (userId: string) => {
//     try {
//       await promoteToTechnician(userId);
//       toast.success('User promoted to Technician');
//     } catch (error) {
//       toast.error('Error promoting user');
//     }
//   };

//   const handleDelete = async (userId: string) => {
//     try {
//       await deleteAccountByAdmin(userId);
//       toast.success('Account deleted');
//     } catch (error) {
//       toast.error('Error deleting account');
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       <h2>Admin Dashboard</h2>
//       <ul>
//         {users.map(user => (
//           <li key={user._id}>
//             {user.name} ({user.role})
//             <button onClick={() => handlePromote(user._id)}>Promote to Technician</button>
//             <button onClick={() => handleDelete(user._id)}>Delete Account</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useEffect, useState } from 'react';
import { promoteToTechnician, deleteAccountByAdmin, getAllUsers, getAllTechnicians } from '../../services/authService.ts';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuth } from '../../redux/slices/authSlice.ts';
import { useNavigate } from 'react-router-dom';

// Define the User interface
interface User {
  _id: string;
  name: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: admin } = useSelector(selectAuth); // Get the admin user details

  useEffect(() => {
    const fetchUsersAndTechnicians = async () => {
      try {
        const { data: usersData } = await getAllUsers();
        const { data: techniciansData } = await getAllTechnicians();
        setUsers(usersData);
        setTechnicians(techniciansData);
      } catch (error) {
        toast.error('Error fetching users or technicians');
      }
    };
    fetchUsersAndTechnicians();
  }, []);

  const handlePromote = async (userId: string) => {
    try {
      await promoteToTechnician(userId);
      toast.success('User promoted to Technician');
      // After promotion, refresh the user list and technician list
      const { data: usersData } = await getAllUsers();
      const { data: techniciansData } = await getAllTechnicians();
      setUsers(usersData);
      setTechnicians(techniciansData);
    } catch (error) {
      toast.error('Error promoting user');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteAccountByAdmin(userId);
      toast.success('Account deleted');
      // Remove the deleted user or technician from the UI without reloading
      setUsers(users.filter(user => user._id !== userId));
      setTechnicians(technicians.filter(technician => technician._id !== userId));
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/'); // Redirect to login page
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {/* Display the admin's name */}
      <h3>Welcome, {admin?.name} (Admin)</h3>
      <button onClick={handleLogout}>Logout</button>

      <h3>All Users</h3>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} ({user.role})
            <button onClick={() => handlePromote(user._id)}>Promote to Technician</button>
            <button onClick={() => handleDelete(user._id)}>Delete Account</button>
          </li>
        ))}
      </ul>

      <h3>All Technicians</h3>
      <ul>
        {technicians.map(technician => (
          <li key={technician._id}>
            {technician.name} ({technician.role})
            {/* Add delete button for technicians */}
            <button onClick={() => handleDelete(technician._id)}>Delete Account</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
