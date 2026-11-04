// Quizzes (multiple choice), questions, choices and attempts (rules 8 to 14).
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { courseModule, lesson } from './catalogue.js';

// A quiz belongs to either a lesson or a module (exclusive arc, rule 8).
// No UNIQUE on lesson_id or module_id: a parent can have several quizzes.
export const quiz = pgTable(
  'quiz',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    // percentage of correct answers needed to pass (rule 11)
    passingScore: integer('passing_score').default(70).notNull(),
    // blocks access to the next module until the quiz is passed (rule 12)
    isBlocking: boolean('is_blocking').default(false).notNull(),
    allowMultipleAttempts: boolean('allow_multiple_attempts')
      .default(false)
      .notNull(),
    lessonId: uuid('lesson_id').references(() => lesson.id, {
      onDelete: 'cascade',
    }),
    moduleId: uuid('module_id').references(() => courseModule.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [
    // num_nonnulls counts the non-NULL arguments: exactly one parent
    check(
      'quiz_single_parent_check',
      sql`num_nonnulls(${table.lessonId}, ${table.moduleId}) = 1`,
    ),
    check(
      'quiz_passing_score_check',
      sql`${table.passingScore} BETWEEN 0 AND 100`,
    ),
  ],
);

// "At least 2 choices including 1 correct" (rule 10) is checked by the Zod schema,
// not by a table constraint.
export const question = pgTable('question', {
  id: uuid('id').primaryKey().defaultRandom(),
  prompt: text('prompt').notNull(),
  // shown after the answer, optional
  explanation: text('explanation'),
  position: integer('position').notNull(),
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quiz.id, { onDelete: 'cascade' }),
});

export const choice = pgTable('choice', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: varchar('label', { length: 255 }).notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => question.id, { onDelete: 'cascade' }),
});

// History: one row per attempt, only the score is stored (rule 14).
export const quizAttempt = pgTable(
  'quiz_attempt',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // number of correct answers
    score: integer('score').notNull(),
    // number of questions at the time of the attempt (the quiz may change later)
    questionCount: integer('question_count').notNull(),
    attemptedAt: timestamp('attempted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // cascade required: otherwise deleting a lesson (which deletes its quizzes) would fail
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quiz.id, { onDelete: 'cascade' }),
  },
  (table) => [
    check(
      'quiz_attempt_score_check',
      sql`${table.score} BETWEEN 0 AND ${table.questionCount}`,
    ),
  ],
);

export const quizRelations = relations(quiz, ({ one, many }) => ({
  lesson: one(lesson, {
    fields: [quiz.lessonId],
    references: [lesson.id],
  }),
  module: one(courseModule, {
    fields: [quiz.moduleId],
    references: [courseModule.id],
  }),
  questions: many(question),
  attempts: many(quizAttempt),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  quiz: one(quiz, {
    fields: [question.quizId],
    references: [quiz.id],
  }),
  choices: many(choice),
}));

export const choiceRelations = relations(choice, ({ one }) => ({
  question: one(question, {
    fields: [choice.questionId],
    references: [question.id],
  }),
}));

export const quizAttemptRelations = relations(quizAttempt, ({ one }) => ({
  user: one(user, {
    fields: [quizAttempt.userId],
    references: [user.id],
  }),
  quiz: one(quiz, {
    fields: [quizAttempt.quizId],
    references: [quiz.id],
  }),
}));

export type Quiz = typeof quiz.$inferSelect;
export type NewQuiz = typeof quiz.$inferInsert;
export type Question = typeof question.$inferSelect;
export type NewQuestion = typeof question.$inferInsert;
export type Choice = typeof choice.$inferSelect;
export type NewChoice = typeof choice.$inferInsert;
export type QuizAttempt = typeof quizAttempt.$inferSelect;
export type NewQuizAttempt = typeof quizAttempt.$inferInsert;
