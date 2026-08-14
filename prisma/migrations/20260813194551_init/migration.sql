-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('Fall', 'Spring', 'Summer', 'Summer/Fall');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('Yes', 'No', 'Maybe');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "courseNumber" TEXT NOT NULL,
    "courseHeader" TEXT NOT NULL,
    "currentUnits" DOUBLE PRECISION,
    "unitsChanged" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rawVariants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "professorId" TEXT,
    "professorRaw" TEXT,
    "multiProf" BOOLEAN NOT NULL DEFAULT false,
    "profUncertain" BOOLEAN NOT NULL DEFAULT false,
    "semester" "Semester" NOT NULL,
    "year" INTEGER NOT NULL,
    "units" DOUBLE PRECISION,
    "recCourse" "Recommendation",
    "recProf" "Recommendation",
    "career" TEXT,
    "careerCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useful" "Recommendation",
    "comments" TEXT,
    "topicTitle" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_departmentId_idx" ON "Course"("departmentId");

-- CreateIndex
CREATE INDEX "Course_courseNumber_idx" ON "Course"("courseNumber");

-- CreateIndex
CREATE INDEX "Professor_name_idx" ON "Professor"("name");

-- CreateIndex
CREATE INDEX "Review_courseId_idx" ON "Review"("courseId");

-- CreateIndex
CREATE INDEX "Review_professorId_idx" ON "Review"("professorId");

-- CreateIndex
CREATE INDEX "Review_careerCategories_idx" ON "Review" USING GIN ("careerCategories");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
