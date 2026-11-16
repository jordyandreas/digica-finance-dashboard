"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { LessonDraft, ModuleDraft } from "@/schemas/course-schema";
import type {
  CurriculumModuleInput,
  LmsCourseDetail,
} from "@/services/courses.service";
import { cn } from "@/lib/utils";
import { slugifyFromTitle } from "@/utils/slugify";
import {
  extractYouTubeVideoId,
  isValidYouTubeVideoRef,
  normalizeYouTubeVideoRef,
} from "@/utils/youtube";

export type LessonDraftState = LessonDraft & { key: string };
export type ModuleDraftState = Omit<ModuleDraft, "lessons"> & {
  key: string;
  lessons: LessonDraftState[];
};

const inputClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function newKey(): string {
  return crypto.randomUUID();
}

export function createEmptyLesson(): LessonDraftState {
  return {
    key: newKey(),
    slug: "",
    title: "",
    excerpt: "",
    duration_minutes: 0,
    cover_image_url: "",
    video_url: "",
    content: "",
  };
}

export function createEmptyModule(): ModuleDraftState {
  return { key: newKey(), title: "", lessons: [] };
}

export function mapCourseToCurriculumDraft(
  course: LmsCourseDetail,
): ModuleDraftState[] {
  return course.modules.map((courseModule) => ({
    key: courseModule.id,
    id: courseModule.id,
    title: courseModule.title,
    lessons: courseModule.lessons.map((lesson) => ({
      key: lesson.id,
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      excerpt: lesson.excerpt,
      duration_minutes: lesson.duration_minutes,
      cover_image_url: lesson.cover_image_url ?? "",
      video_url: lesson.media.video_url,
      content: lesson.media.content,
    })),
  }));
}

export function mapCurriculumDraftToInput(
  modules: ModuleDraftState[],
): CurriculumModuleInput[] {
  return modules.map((courseModule) => ({
    id: courseModule.id,
    title: courseModule.title,
    lessons: courseModule.lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      excerpt: lesson.excerpt,
      duration_minutes: lesson.duration_minutes,
      cover_image_url: lesson.cover_image_url,
      video_url: normalizeYouTubeVideoRef(lesson.video_url),
      content: lesson.content,
    })),
  }));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) {
    return items;
  }
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

interface CurriculumEditorProps {
  modules: ModuleDraftState[];
  onChange: (modules: ModuleDraftState[]) => void;
  disabled?: boolean;
}

export function CurriculumEditor({
  modules,
  onChange,
  disabled = false,
}: CurriculumEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updateModule = (
    moduleKey: string,
    updater: (courseModule: ModuleDraftState) => ModuleDraftState,
  ) => {
    onChange(
      modules.map((item) => (item.key === moduleKey ? updater(item) : item)),
    );
  };

  const updateLesson = (
    moduleKey: string,
    lessonKey: string,
    patch: Partial<LessonDraftState>,
  ) => {
    updateModule(moduleKey, (courseModule) => ({
      ...courseModule,
      lessons: courseModule.lessons.map((lesson) =>
        lesson.key === lessonKey ? { ...lesson, ...patch } : lesson,
      ),
    }));
  };

  const handleLessonTitleChange = (
    moduleKey: string,
    lesson: LessonDraftState,
    title: string,
  ) => {
    const slugFollowsTitle =
      !lesson.slug || lesson.slug === slugifyFromTitle(lesson.title);
    updateLesson(moduleKey, lesson.key, {
      title,
      ...(slugFollowsTitle ? { slug: slugifyFromTitle(title) } : {}),
    });
  };

  const addLesson = (moduleKey: string) => {
    const lesson = createEmptyLesson();
    setExpanded((prev) => new Set(prev).add(lesson.key));
    updateModule(moduleKey, (courseModule) => ({
      ...courseModule,
      lessons: [...courseModule.lessons, lesson],
    }));
  };

  const addModule = () => {
    onChange([...modules, createEmptyModule()]);
  };

  return (
    <div className="space-y-4">
      {modules.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No modules yet. Add the first module to start building the curriculum.
        </p>
      ) : null}

      {modules.map((courseModule, moduleIndex) => (
        <Card key={courseModule.key} className="space-y-4 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field
              label={`Module ${moduleIndex + 1} title`}
              className="flex-1"
            >
              <input
                className={inputClassName}
                value={courseModule.title}
                disabled={disabled}
                placeholder="e.g. Getting started"
                onChange={(event) =>
                  updateModule(courseModule.key, (current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || moduleIndex === 0}
                onClick={() => onChange(moveItem(modules, moduleIndex, -1))}
                aria-label="Move module up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || moduleIndex === modules.length - 1}
                onClick={() => onChange(moveItem(modules, moduleIndex, 1))}
                aria-label="Move module down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() =>
                  onChange(modules.filter((item) => item.key !== courseModule.key))
                }
                aria-label="Remove module"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {courseModule.lessons.map((lesson, lessonIndex) => {
              const isOpen = expanded.has(lesson.key);
              const videoId = extractYouTubeVideoId(lesson.video_url);
              const videoInvalid = !isValidYouTubeVideoRef(lesson.video_url);

              return (
                <div
                  key={lesson.key}
                  className="rounded-lg border bg-muted/20 p-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => toggleExpanded(lesson.key)}
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate text-sm font-medium">
                        {lessonIndex + 1}. {lesson.title || "Untitled lesson"}
                      </span>
                      {lesson.duration_minutes > 0 ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {lesson.duration_minutes} min
                        </span>
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled || lessonIndex === 0}
                      onClick={() =>
                        updateModule(courseModule.key, (current) => ({
                          ...current,
                          lessons: moveItem(current.lessons, lessonIndex, -1),
                        }))
                      }
                      aria-label="Move lesson up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={
                        disabled ||
                        lessonIndex === courseModule.lessons.length - 1
                      }
                      onClick={() =>
                        updateModule(courseModule.key, (current) => ({
                          ...current,
                          lessons: moveItem(current.lessons, lessonIndex, 1),
                        }))
                      }
                      aria-label="Move lesson down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled}
                      onClick={() =>
                        updateModule(courseModule.key, (current) => ({
                          ...current,
                          lessons: current.lessons.filter(
                            (item) => item.key !== lesson.key,
                          ),
                        }))
                      }
                      aria-label="Remove lesson"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {isOpen ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Title">
                        <input
                          className={inputClassName}
                          value={lesson.title}
                          disabled={disabled}
                          onChange={(event) =>
                            handleLessonTitleChange(
                              courseModule.key,
                              lesson,
                              event.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field
                        label="Slug"
                        hint="Unique within this module."
                      >
                        <input
                          className={cn(inputClassName, "font-mono text-xs")}
                          value={lesson.slug}
                          disabled={disabled}
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              slug: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field
                        label="Excerpt"
                        className="sm:col-span-2"
                      >
                        <Textarea
                          rows={2}
                          value={lesson.excerpt}
                          disabled={disabled}
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              excerpt: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Duration (minutes)">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          className={inputClassName}
                          value={lesson.duration_minutes}
                          disabled={disabled}
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              duration_minutes:
                                event.target.value === ""
                                  ? 0
                                  : Number.parseInt(event.target.value, 10) ||
                                    0,
                            })
                          }
                        />
                      </Field>
                      <Field label="Cover image URL">
                        <input
                          className={inputClassName}
                          value={lesson.cover_image_url}
                          disabled={disabled}
                          placeholder="https://..."
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              cover_image_url: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field
                        label="Video (YouTube Unlisted)"
                        className="sm:col-span-2"
                        hint={
                          videoInvalid ? (
                            <span className="text-destructive">
                              Not a valid YouTube link or video id.
                            </span>
                          ) : videoId ? (
                            <>
                              Will be saved as{" "}
                              <span className="font-mono">{videoId}</span>
                            </>
                          ) : (
                            "Paste the YouTube link (watch, youtu.be, or embed) or the 11-character id."
                          )
                        }
                      >
                        <input
                          className={cn(
                            inputClassName,
                            videoInvalid && "border-destructive",
                          )}
                          value={lesson.video_url}
                          disabled={disabled}
                          placeholder="https://youtu.be/..."
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              video_url: event.target.value,
                            })
                          }
                          onBlur={() =>
                            updateLesson(courseModule.key, lesson.key, {
                              video_url: normalizeYouTubeVideoRef(
                                lesson.video_url,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field
                        label="Content"
                        className="sm:col-span-2"
                        hint="Lesson notes shown below the video."
                      >
                        <Textarea
                          rows={8}
                          value={lesson.content}
                          disabled={disabled}
                          onChange={(event) =>
                            updateLesson(courseModule.key, lesson.key, {
                              content: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => addLesson(courseModule.key)}
            >
              <Plus className="h-4 w-4" />
              Add lesson
            </Button>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={addModule}
      >
        <Plus className="h-4 w-4" />
        Add module
      </Button>
    </div>
  );
}
