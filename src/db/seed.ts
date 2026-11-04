// Fills the database with the initial data: `npm run db:seed`.
// - the three roles (always);
// - a teacher and a small demo course (outside production only).
// The script can be run again without creating duplicates.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createAuth } from '../auth/auth.js';
import * as schema from './schema/index.js';
import {
  choice,
  course,
  courseModule,
  lesson,
  question,
  quiz,
  role,
  user,
  userRole,
} from './schema/index.js';

const db = drizzle(process.env.DATABASE_URL!, { schema });
const auth = createAuth(db);

const DEMO_TEACHER = {
  name: 'Julien Prof',
  email: 'prof@demo.local',
  password: 'Demo1234!',
};

async function seedRoles() {
  // onConflictDoNothing: a role that already exists (UNIQUE label) is skipped
  await db
    .insert(role)
    .values([{ label: 'ADMIN' }, { label: 'TEACHER' }, { label: 'STUDENT' }])
    .onConflictDoNothing();
  console.log('Roles: OK');
}

async function seedDemo() {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, DEMO_TEACHER.email),
  });
  if (existing) {
    console.log('Demo data already present');
    return;
  }

  // The account is created through Better Auth: it creates the user row
  // and the account row with the hashed password.
  const { user: teacher } = await auth.api.signUpEmail({ body: DEMO_TEACHER });

  const teacherRole = await db.query.role.findFirst({
    where: eq(role.label, 'TEACHER'),
  });
  await db
    .insert(userRole)
    .values({ userId: teacher.id, roleId: teacherRole!.id });

  // Transaction: if an insert fails, nothing is kept.
  await db.transaction(async (tx) => {
    // .returning() gives back the inserted rows, with the generated id
    const [demoCourse] = await tx
      .insert(course)
      .values({
        title: 'Premiers pas avec la souris',
        description: 'Apprendre à utiliser la souris pas à pas.',
        theme: 'COMPUTER_BASICS',
        level: 'BEGINNER',
        status: 'PUBLISHED',
        creatorId: teacher.id,
      })
      .returning();

    const [demoModule] = await tx
      .insert(courseModule)
      .values({
        title: 'Découvrir la souris',
        position: 1,
        courseId: demoCourse.id,
      })
      .returning();

    await tx.insert(lesson).values({
      title: 'Le clic gauche',
      position: 1,
      estimatedMinutes: 5,
      moduleId: demoModule.id,
      // minimal Tiptap document: a heading and a paragraph
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Le clic gauche' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Appuyez une fois sur le bouton gauche pour sélectionner.',
              },
            ],
          },
        ],
      },
    });

    // A module has at least one quiz (rule 8)
    const [demoQuiz] = await tx
      .insert(quiz)
      .values({ title: 'Quiz : la souris', moduleId: demoModule.id })
      .returning();

    const [demoQuestion] = await tx
      .insert(question)
      .values({
        prompt: 'Quel bouton sert à sélectionner ?',
        explanation: 'Le clic gauche sélectionne, le clic droit ouvre un menu.',
        position: 1,
        quizId: demoQuiz.id,
      })
      .returning();

    await tx.insert(choice).values([
      {
        label: 'Le bouton gauche',
        isCorrect: true,
        questionId: demoQuestion.id,
      },
      {
        label: 'Le bouton droit',
        isCorrect: false,
        questionId: demoQuestion.id,
      },
      { label: 'La molette', isCorrect: false, questionId: demoQuestion.id },
    ]);
  });

  console.log(
    `Demo: teacher ${DEMO_TEACHER.email} / ${DEMO_TEACHER.password} and one course created`,
  );
}

async function main() {
  await seedRoles();
  // never an account with a known password in production
  if (process.env.NODE_ENV !== 'production') {
    await seedDemo();
  }
}

try {
  await main();
} finally {
  // close the pool, otherwise the script never exits
  await db.$client.end();
}
