// User roles (rule 1). Roles are managed here and not by the Better Auth
// admin plugin: a user can hold several roles.
import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth.js';

// Reference table: ADMIN, TEACHER, STUDENT (inserted by the seed).
export const role = pgTable('role', {
  id: serial('id').primaryKey(),
  label: varchar('label', { length: 50 }).notNull().unique(),
});

// Many-to-many join table between user and role.
export const userRole = pgTable(
  'user_role',
  {
    // text: user.id is a Better Auth id, not a uuid
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // no cascade: a role still assigned to someone cannot be deleted
    roleId: integer('role_id')
      .notNull()
      .references(() => role.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const roleRelations = relations(role, ({ many }) => ({
  userRoles: many(userRole),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id],
  }),
}));

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;
export type UserRole = typeof userRole.$inferSelect;
export type NewUserRole = typeof userRole.$inferInsert;
