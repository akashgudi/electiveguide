"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  reviewFormSchema,
  type ReviewFormValues,
  type ReviewFormInput,
  COURSE_NUMBER_REGEX,
} from "@/lib/validations/review";
import {
  DEPARTMENTS,
  CAREER_CATEGORIES,
  SEMESTERS,
  RECOMMENDATIONS,
} from "@/lib/constants";
import { submitReviewAction } from "@/actions/reviews";

// Newest first, matching the 2000–next-year range the validation allows.
const NEXT_YEAR = new Date().getFullYear() + 1;
const YEAR_OPTIONS = Array.from({ length: NEXT_YEAR - 2000 + 1 }, (_, i) => String(NEXT_YEAR - i));

interface CourseOption {
  id: string;
  courseNumber: string;
  courseHeader: string;
  currentUnits: number | null;
}

interface ProfessorOption {
  id: string;
  name: string;
}

export function ReviewForm({
  courses,
  professors,
  defaultCourseId,
}: {
  courses: CourseOption[];
  professors: ProfessorOption[];
  defaultCourseId?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [courseComboOpen, setCourseComboOpen] = useState(false);
  const defaultCourse = courses.find((c) => c.id === defaultCourseId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormInput, unknown, ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      isNewCourse: false,
      courseId: defaultCourse?.id,
      courseNumber: defaultCourse?.courseNumber,
      units: defaultCourse?.currentUnits ?? undefined,
      isNewProfessor: false,
      professorIds: [],
      newProfessorNames: [],
      careerCategories: [],
      comments: "",
      reviewerName: "",
      reviewerEmail: "",
    },
  });

  const isNewCourse = watch("isNewCourse");
  const isNewProfessor = watch("isNewProfessor");
  const courseNumber = watch("courseNumber");
  const newCourseNumber = watch("newCourse.courseNumber");
  const selectedCourseId = watch("courseId");
  const selectedProfessorIds = watch("professorIds") ?? [];
  const selectedCategories = watch("careerCategories") ?? [];
  const newProfessorNames = watch("newProfessorNames") ?? [];

  const effectiveCourseNumber = isNewCourse ? newCourseNumber : courseNumber;
  const showTopicTitle =
    !!effectiveCourseNumber &&
    COURSE_NUMBER_REGEX.test(effectiveCourseNumber) &&
    effectiveCourseNumber.includes("599");

  async function onSubmit(values: ReviewFormValues) {
    setServerError(null);
    const result = await submitReviewAction(values);
    if (!result.success) {
      setServerError(result.errors?.form ?? "Please fix the errors above.");
      return;
    }
    router.push(`/submit-review/thanks?course=${encodeURIComponent(result.courseId!)}`);
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Course */}
      <fieldset className="space-y-3 border border-border p-4">
        <legend className="px-1 text-sm font-medium">Course</legend>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isNewCourse"
            checked={isNewCourse}
            onCheckedChange={(v) => setValue("isNewCourse", !!v)}
          />
          <Label htmlFor="isNewCourse">This course isn&apos;t listed</Label>
        </div>

        {!isNewCourse ? (
          <div className="space-y-1.5">
            <Popover open={courseComboOpen} onOpenChange={setCourseComboOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedCourseId
                        ? courses.find((c) => c.id === selectedCourseId)
                            ?.courseHeader
                        : "Select a course"}
                    </span>
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-[--anchor-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search course..." />
                  <CommandList>
                    <CommandEmpty>No course found.</CommandEmpty>
                    <CommandGroup>
                      {courses.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.courseNumber} ${c.courseHeader}`}
                          onSelect={() => {
                            setValue("courseId", c.id);
                            setValue("courseNumber", c.courseNumber);
                            if (c.currentUnits != null)
                              setValue("units", c.currentUnits);
                            setCourseComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              selectedCourseId === c.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {c.courseHeader}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.courseId && (
              <p className="text-sm text-destructive">
                {errors.courseId.message}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Controller
                control={control}
                name="newCourse.department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.newCourse?.department && (
                <p className="text-sm text-destructive">
                  {errors.newCourse.department.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Course number</Label>
              <Input
                placeholder="e.g. ACCT 505"
                {...register("newCourse.courseNumber")}
              />
              {errors.newCourse?.courseNumber && (
                <p className="text-sm text-destructive">
                  {errors.newCourse.courseNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Course title</Label>
              <Input
                placeholder="e.g. Business Sustainability Reporting and Analysis"
                {...register("newCourse.title")}
              />
              {errors.newCourse?.title && (
                <p className="text-sm text-destructive">
                  {errors.newCourse.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Units</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="3"
                {...register("newCourse.currentUnits")}
              />
              {errors.newCourse?.currentUnits && (
                <p className="text-sm text-destructive">
                  {errors.newCourse.currentUnits.message}
                </p>
              )}
            </div>
          </div>
        )}

        {showTopicTitle && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <Label>Specific topic offered</Label>
            <p className="text-xs text-muted-foreground">
              This is a Special Topics course — the topic changes each time
              it&apos;s offered. Enter what it was actually about (e.g.
              &quot;Generative AI and Automation&quot;).
            </p>
            <Input
              placeholder="e.g. Generative AI and Automation"
              {...register("topicTitle")}
            />
            {errors.topicTitle && (
              <p className="text-sm text-destructive">
                {errors.topicTitle.message}
              </p>
            )}
          </div>
        )}
      </fieldset>

      {/* Professor */}
      <fieldset className="space-y-3 border border-border p-4">
        <legend className="px-1 text-sm font-medium">Professor</legend>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isNewProfessor"
            checked={isNewProfessor}
            onCheckedChange={(v) => setValue("isNewProfessor", !!v)}
          />
          <Label htmlFor="isNewProfessor">
            This professor isn&apos;t listed
          </Label>
        </div>

        {!isNewProfessor ? (
          <div className="space-y-1.5">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {selectedProfessorIds.length
                        ? `${selectedProfessorIds.length} selected`
                        : "Select professor(s)"}
                    </span>
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-[--anchor-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search professor..." />
                  <CommandList>
                    <CommandEmpty>No professor found.</CommandEmpty>
                    <CommandGroup>
                      {professors.map((p) => {
                        const checked = selectedProfessorIds.includes(p.id);
                        return (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              setValue(
                                "professorIds",
                                checked
                                  ? selectedProfessorIds.filter(
                                      (id) => id !== p.id,
                                    )
                                  : [...selectedProfessorIds, p.id],
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "size-4",
                                checked ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedProfessorIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedProfessorIds.map((id) => {
                  const p = professors.find((p) => p.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setValue(
                          "professorIds",
                          selectedProfessorIds.filter((x) => x !== id),
                        )
                      }
                    >
                      {p?.name}
                      <X className="size-3" />
                    </Badge>
                  );
                })}
              </div>
            )}
            {errors.professorIds && (
              <p className="text-sm text-destructive">
                {errors.professorIds.message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(newProfessorNames.length ? newProfessorNames : [""]).map(
              (name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder='Format: "Last, First"'
                    value={name}
                    onChange={(e) => {
                      const next = [
                        ...(newProfessorNames.length
                          ? newProfessorNames
                          : [""]),
                      ];
                      next[i] = e.target.value;
                      setValue("newProfessorNames", next);
                    }}
                  />
                  {newProfessorNames.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setValue(
                          "newProfessorNames",
                          newProfessorNames.filter((_, idx) => idx !== i),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValue("newProfessorNames", [
                  ...(newProfessorNames.length ? newProfessorNames : [""]),
                  "",
                ])
              }
            >
              <Plus className="size-4" />
              Add co-professor
            </Button>
            {errors.newProfessorNames && (
              <p className="text-sm text-destructive">
                {Array.isArray(errors.newProfessorNames)
                  ? errors.newProfessorNames.find((e) => e)?.message
                  : errors.newProfessorNames.message}
              </p>
            )}
          </div>
        )}
      </fieldset>

      {/* Review details */}
      <fieldset className="space-y-4 border border-border p-4">
        <legend className="px-1 text-sm font-medium">Review details</legend>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Semester</Label>
            <Controller
              control={control}
              name="semester"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.semester && (
              <p className="text-sm text-destructive">
                {errors.semester.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <Select
                  value={field.value === undefined ? undefined : String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Units</Label>
            <Input type="number" step="0.5" {...register("units")} />
            {errors.units && (
              <p className="text-sm text-destructive">{errors.units.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["recCourse", "recProf", "useful"] as const).map((field) => {
            const labels = {
              recCourse: "Recommend course?",
              recProf: "Recommend professor?",
              useful: "Useful for career?",
            };
            return (
              <div key={field} className="space-y-1.5">
                <Label>{labels[field]}</Label>
                <Controller
                  control={control}
                  name={field}
                  render={({ fieldState, field: f }) => (
                    <>
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {RECOMMENDATIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-sm text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <Label>Career categories</Label>
          <p className="text-xs text-muted-foreground">
            What career path(s) are you pursuing? Your peers may use this
            information to help understand the context of your feedback.
          </p>
          <div className="flex flex-wrap gap-2">
            {CAREER_CATEGORIES.map((cat) => {
              const checked = selectedCategories.includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={checked ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setValue(
                      "careerCategories",
                      checked
                        ? selectedCategories.filter((c) => c !== cat)
                        : [...selectedCategories, cat],
                    )
                  }
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
          {errors.careerCategories && (
            <p className="text-sm text-destructive">
              {errors.careerCategories.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comments">Comments</Label>
          <p id="comments-hint" className="text-xs text-muted-foreground">
            Please share your thoughts on the course, professor, and content, including what you found most
            valuable and any advice for future students.
          </p>
          <Textarea id="comments" rows={5} aria-describedby="comments-hint" {...register("comments")} />
          {errors.comments && (
            <p className="text-sm text-destructive">
              {errors.comments.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Reviewer */}
      <fieldset className="space-y-3 border border-border p-4">
        <legend className="px-1 text-sm font-medium">About you</legend>
        <p className="text-xs text-muted-foreground">
          We use this only to check that reviews are genuine. It&apos;s never shown publicly and is deleted once your
          review is approved.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reviewerName">Name</Label>
            <Input id="reviewerName" autoComplete="name" {...register("reviewerName")} />
            {errors.reviewerName && <p className="text-sm text-destructive">{errors.reviewerName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reviewerEmail">Email</Label>
            <Input id="reviewerEmail" type="email" autoComplete="email" {...register("reviewerEmail")} />
            {errors.reviewerEmail && <p className="text-sm text-destructive">{errors.reviewerEmail.message}</p>}
          </div>
        </div>
      </fieldset>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
