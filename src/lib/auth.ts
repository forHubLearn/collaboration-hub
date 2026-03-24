import { UserRole } from './types';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  enabled: boolean;
}

const USERS_KEY = 'bms_users';
const AUTH_KEY = 'bms_auth';

function getUsers(): AppUser[] {
  try {
    const v = localStorage.getItem(USERS_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function seedDefaultUsers() {
  if (getUsers().length > 0) return;
  const defaults: AppUser[] = [
    { id: 'user-admin', name: 'Admin', email: 'admin@store.com', password: 'admin123', role: 'admin', enabled: true },
    { id: 'user-sales', name: 'Sales Staff', email: 'sales@store.com', password: 'sales123', role: 'sales', enabled: true },
  ];
  saveUsers(defaults);
}

export function login(email: string, password: string): AppUser | null {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return null;
  if (!user.enabled) return null;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AppUser | null {
  try {
    const v = localStorage.getItem(AUTH_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export function getAllUsers(): AppUser[] {
  return getUsers();
}

export function addUser(user: AppUser) {
  const users = getUsers();
  if (users.find(u => u.email === user.email)) {
    throw new Error('Email already exists');
  }
  users.push(user);
  saveUsers(users);
}

export function updateUser(user: AppUser) {
  saveUsers(getUsers().map(u => u.id === user.id ? user : u));
  // Update current session if editing self
  const current = getCurrentUser();
  if (current && current.id === user.id) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function toggleUserEnabled(id: string) {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (user) {
    user.enabled = !user.enabled;
    saveUsers(users);
  }
}
