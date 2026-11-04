// Student tracking: enrollments and completed lessons (rules 13, 15, 16).
// Course progress is not stored: it is computed
// (completed lessons / lessons in the course).
import { relations } from 'drizzle-orm';
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { course, lesson } from './catalogue.js';

// The composite primary key prevents enrolling twice in the same course.
export const enrollment = pgTable(
  'enrollment',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })],
);

// A lesson can only be completed once: composite primary key.
export const completedLesson = pgTable(
  'completed_lesson',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lesson.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
}));

export const completedLessonRelations = relations(
  completedLesson,
  ({ one }) => ({
    user: one(user, {
      fields: [completedLesson.userId],
      references: [user.id],
    }),
    lesson: one(lesson, {
      fields: [completedLesson.lessonId],
      references: [lesson.id],
    }),
  }),
);

export type Enrollment = typeof enrollment.$inferSelect;
export type NewEnrollment = typeof enrollment.$inferInsert;
export type CompletedLesson = typeof completedLesson.$inferSelect;
export type NewCompletedLesson = typeof completedLesson.$inferInsert;
