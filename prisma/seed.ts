import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";

const DATA_DIR = join(__dirname, "..", "data");

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, name), "utf-8"));
}

type SeedDepartment = string;

interface SeedCourse {
  course_id: string;
  department: string;
  course_number: string;
  course_header: string;
  current_units: number | null;
  units_changed: boolean;
}

interface SeedProfessor {
  professor_id: string;
  name: string;
  raw_variants: string[];
}

interface SeedReview {
  review_id: number;
  course_id: string;
  professor_id: string | null;
  professor_raw: string | null;
  multi_prof: boolean;
  prof_uncertain: boolean;
  semester: string;
  year: number;
  units: number | null;
  rec_course: string | null;
  rec_prof: string | null;
  career: string | null;
  career_categories: string[];
  useful: string | null;
  comments: string | null;
  topic_title: string;
}

function toSemester(raw: string): string {
  return raw === "Summer/Fall" ? "Summer_Fall" : raw;
}

async function main() {
  const departments = readJson<SeedDepartment[]>("departments.json");
  const courses = readJson<SeedCourse[]>("courses.json");
  const professors = readJson<SeedProfessor[]>("professors.json");
  const reviews = readJson<SeedReview[]>("reviews.json");

  console.log(`Seeding ${departments.length} departments, ${courses.length} courses, ${professors.length} professors, ${reviews.length} reviews...`);

  for (const id of departments) {
    await prisma.department.upsert({ where: { id }, update: {}, create: { id } });
  }
  console.log(`Departments: ${departments.length} upserted`);

  await prisma.professor.createMany({
    data: professors.map((p) => ({
      id: p.professor_id,
      name: p.name,
      rawVariants: p.raw_variants,
      verified: true,
    })),
    skipDuplicates: true,
  });
  console.log(`Professors: ${professors.length} inserted`);

  await prisma.course.createMany({
    data: courses.map((c) => ({
      id: c.course_id,
      departmentId: c.department,
      courseNumber: c.course_number,
      courseHeader: c.course_header,
      currentUnits: c.current_units,
      unitsChanged: c.units_changed,
      verified: true,
    })),
    skipDuplicates: true,
  });
  console.log(`Courses: ${courses.length} inserted`);

  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    await prisma.review.createMany({
      data: batch.map((r) => ({
        id: r.review_id,
        courseId: r.course_id,
        professorId: r.professor_id,
        professorRaw: r.professor_raw,
        multiProf: r.multi_prof,
        profUncertain: r.prof_uncertain,
        semester: toSemester(r.semester) as any,
        year: r.year,
        units: r.units,
        recCourse: r.rec_course as any,
        recProf: r.rec_prof as any,
        career: r.career,
        careerCategories: r.career_categories,
        useful: r.useful as any,
        comments: r.comments,
        topicTitle: r.topic_title,
      })),
      skipDuplicates: true,
    });
    inserted += batch.length;
    console.log(`Reviews: ${inserted}/${reviews.length}`);
  }

  // createMany with explicit ids does not advance Postgres's identity/serial
  // sequence, so the next form-submitted review would collide with a seeded id.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Review"', 'id'), (SELECT MAX(id) FROM "Review"))`
  );

  const [deptCount, courseCount, profCount, reviewCount] = await Promise.all([
    prisma.department.count(),
    prisma.course.count(),
    prisma.professor.count(),
    prisma.review.count(),
  ]);

  console.table({ departments: deptCount, courses: courseCount, professors: profCount, reviews: reviewCount });

  if (
    deptCount !== departments.length ||
    courseCount !== courses.length ||
    profCount !== professors.length ||
    reviewCount !== reviews.length
  ) {
    throw new Error(
      `Seed count mismatch: expected ${departments.length}/${courses.length}/${professors.length}/${reviews.length}, got ${deptCount}/${courseCount}/${profCount}/${reviewCount}`
    );
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
