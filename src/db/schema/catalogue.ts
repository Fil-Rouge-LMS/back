// Learning content: courses, modules, lessons and images (rules 2 to 7).
import type { JSONContent } from '@tiptap/core';
import { relations } from 'drizzle-orm';
import {
  type AnyPgColumn,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { completedLesson, enrollment } from './progression.js';
import { quiz } from './quiz.js';

export const themeEnum = pgEnum('theme', [
  'COMPUTER_BASICS',
  'PROGRAMMING_BASICS',
  'INTERNET_BASICS',
]);

export const levelEnum = pgEnum('level', [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
]);

export const courseStatusEnum = pgEnum('course_status', [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
]);

export const visibilityEnum = pgEnum('visibility', ['PUBLIC', 'PRIVATE']);

export const course = pgTable('course', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  theme: themeEnum('theme').notNull(),
  level: levelEnum('level').notNull(),
  status: courseStatusEnum('status').default('DRAFT').notNull(),
  visibility: visibilityEnum('visibility').default('PUBLIC').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // no cascade: a teacher who still has courses cannot be deleted
  creatorId: text('creator_id')
    .notNull()
    .references(() => user.id),
  // the cover is optional; if the image is deleted, the course loses it.
  // `: AnyPgColumn` breaks the circular reference course -> image -> lesson
  // -> module -> course, which TypeScript cannot infer on its own.
  coverImageId: uuid('cover_image_id').references((): AnyPgColumn => image.id, {
    onDelete: 'set null',
  }),
});

// `courseModule` in TypeScript to avoid confusion with Node's global
// `module` variable; the table itself is named `module`.
export const courseModule = pgTable(
  'module',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    // "position" rather than "order": ORDER is a reserved word in SQL
    position: integer('position').notNull(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => course.id, { onDelete: 'cascade' }),
    coverImageId: uuid('cover_image_id').references(
      (): AnyPgColumn => image.id,
      {
        onDelete: 'set null',
      },
    ),
  },
  // two modules of the same course cannot share a position
  (table) => [unique().on(table.courseId, table.position)],
);

export const lesson = pgTable(
  'lesson',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    // Tiptap document stored as JSON (not HTML, to limit XSS risks).
    // $type changes nothing in the database: it only types the column in TypeScript.
    content: jsonb('content').$type<JSONContent>().notNull(),
    estimatedMinutes: integer('estimated_minutes'),
    position: integer('position').notNull(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => courseModule.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.moduleId, table.position)],
);

// Image uploaded to Cloudflare R2. Images from external URLs are not stored here.
// lesson_id is set for an image inserted in a lesson, null for a cover image.
// Warning: the cascade deletes the database row, never the file in R2.
export const image = pgTable('image', {
  id: uuid('id').primaryKey().defaultRandom(),
  // path of the object in the R2 bucket
  storageKey: varchar('storage_key', { length: 512 }).notNull().unique(),
  alt: varchar('alt', { length: 255 }).notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lessonId: uuid('lesson_id').references(() => lesson.id, {
    onDelete: 'cascade',
  }),
});

export const courseRelations = relations(course, ({ one, many }) => ({
  creator: one(user, {
    fields: [course.creatorId],
    references: [user.id],
  }),
  coverImage: one(image, {
    fields: [course.coverImageId],
    references: [image.id],
  }),
  modules: many(courseModule),
  enrollments: many(enrollment),
}));

export const courseModuleRelations = relations(
  courseModule,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseModule.courseId],
      references: [course.id],
    }),
    coverImage: one(image, {
      fields: [courseModule.coverImageId],
      references: [image.id],
    }),
    lessons: many(lesson),
    quizzes: many(quiz),
  }),
);

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  module: one(courseModule, {
    fields: [lesson.moduleId],
    references: [courseModule.id],
  }),
  images: many(image),
  quizzes: many(quiz),
  completions: many(completedLesson),
}));

export const imageRelations = relations(image, ({ one }) => ({
  lesson: one(lesson, {
    fields: [image.lessonId],
    references: [lesson.id],
  }),
}));

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;
export type CourseModule = typeof courseModule.$inferSelect;
export type NewCourseModule = typeof courseModule.$inferInsert;
export type Lesson = typeof lesson.$inferSelect;
export type NewLesson = typeof lesson.$inferInsert;
export type Image = typeof image.$inferSelect;
export type NewImage = typeof image.$inferInsert;
