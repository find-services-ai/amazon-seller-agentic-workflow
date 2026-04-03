import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import config from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const USERS_FILE = join(__dirname, '..', 'users.json')

// ─── User Store ──────────────────────────────────────────────

function loadUsers() {
  if (!existsSync(USERS_FILE)) return []
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'))
}

function saveUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// ─── Auth Functions ──────────────────────────────────────────

export async function registerUser(email, password, name) {
  const users = loadUsers()
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists')
  }
  const hash = await bcrypt.hash(password, 10)
  const user = {
    id: Date.now().toString(36),
    email,
    name: name || email.split('@')[0],
    passwordHash: hash,
    role: users.length === 0 ? 'admin' : 'viewer',
    createdAt: new Date().toISOString()
  }
  users.push(user)
  saveUsers(users)
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function loginUser(email, password) {
  const users = loadUsers()
  const user = users.find(u => u.email === email)
  if (!user) throw new Error('Invalid credentials')
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.auth.jwtSecret,
    { expiresIn: `${config.auth.sessionHours}h` }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, config.auth.jwtSecret)
}

// ─── Middleware ───────────────────────────────────────────────

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = verifyToken(header.slice(7))
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
