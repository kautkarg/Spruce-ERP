/**
 * @file This file contains the mock data for users and provides functions
 * for managing this data in-memory. This is a crucial file for defining who
 * can access the system and what their roles are. In a real application, this
 * data would be stored in a secure database.
 */
import { type Role } from './roles-data';
import { type User as UserType } from './types';

// The initial array of user data, representing all users in the system.
export let users: UserType[] = [
    {
        id: 'user-1',
        name: 'Super Admin',
        email: 'admin@spruce.com',
        role: { id: 'super-admin', name: 'Super Admin' },
    },
    {
        id: 'user-2',
        name: 'Sanya Iyer',
        email: 'sanya.iyer@example.com',
        role: { id: 'admin', name: 'Admin' },
    },
    {
        id: 'user-3',
        name: 'Rohan Mehta',
        email: 'rohan.mehta@example.com',
        role: { id: 'admin', name: 'Admin'},
    },
    {
        id: 'user-4',
        name: 'Anjali Rao',
        email: 'anjali.rao@example.com',
        role: { id: 'admin', name: 'Admin' },
    },
    {
        id: 'user-5',
        name: 'Shivani Bisen',
        email: 'shivani.bisen@example.com',
        role: { id: 'counselor', name: 'Counselor' },
    },
     {
        id: 'user-6',
        name: 'Pooja Verma',
        email: 'pooja.verma@example.com',
        role: { id: 'counselor', name: 'Counselor' },
    },
    {
        id: 'user-11',
        name: 'Shivani Pande',
        email: 'shivani.pande@example.com',
        role: { id: 'counselor', name: 'Counselor' },
    },
    {
        id: 'user-12',
        name: 'Pratiksha',
        email: 'pratiksha@example.com',
        role: { id: 'counselor', name: 'Counselor' },
    },
     {
        id: 'user-7',
        name: 'Aditya Verma',
        email: 'aditya.verma@example.com',
        role: { id: 'faculty-trainer', name: 'Faculty/Trainer' },
    },
      {
        id: 'user-8',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        role: { id: 'faculty-trainer', name: 'Faculty/Trainer' },
    },
      {
        id: 'user-9',
        name: 'Arjun Nair',
        email: 'arjun.nair@example.com',
        role: { id: 'finance', name: 'Finance' },
    },
      {
        id: 'user-10',
        name: 'Kabir Das',
        email: 'kabir.das@example.com',
        role: { id: 'finance', name: 'Finance' },
    }
];

/**
 * Adds a new user to the in-memory user list. This function simulates
 * creating a new user record in a database.
 * @param user - An object containing the new user's name, email, and role object.
 * @returns The newly created user object, complete with a generated ID.
 */
export function addUser(user: { name: string; email: string; role: Role }): UserType {
    const newUser: UserType = {
        ...user,
        id: `user-${Date.now()}`,
        role: { id: user.role.id, name: user.role.name }
    };
    users.push(newUser);
    return newUser;
}
