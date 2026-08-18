import { Badge } from "@/components/ui/badge";

export interface ReviewCardData {
  id: number;
  semester: string;
  year: number;
  units: number | null;
  recCourse: string | null;
  recProf: string | null;
  useful: string | null;
  comments: string | null;
  topicTitle: string;
  multiProf: boolean;
  professorRaw: string | null;
  professor: { id: string; name: string; verified: boolean } | null;
}

function semesterLabel(s: string) {
  return s === "Summer_Fall" ? "Summer/Fall" : s;
}

export function ReviewCard({ review, showTopicTitle }: { review: ReviewCardData; showTopicTitle: boolean }) {
  return (
    <div className="space-y-3 border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {showTopicTitle && <h3 className="text-base font-semibold">{review.topicTitle}</h3>}
          <p className="text-sm text-muted-foreground">
            {semesterLabel(review.semester)} {review.year}
            {review.professor ? (
              <>
                {" · "}
                {review.professor.name}
                {!review.professor.verified && (
                  <Badge variant="warning" className="ml-1.5 align-middle">
                    Unverified
                  </Badge>
                )}
              </>
            ) : review.professorRaw ? (
              <> · {review.professorRaw}</>
            ) : null}
            {review.units != null && <> · {review.units} units</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {review.recCourse && <Badge variant="outline">Course: {review.recCourse}</Badge>}
          {review.recProf && <Badge variant="outline">Prof: {review.recProf}</Badge>}
          {review.useful && <Badge variant="outline">Useful: {review.useful}</Badge>}
        </div>
      </div>
      {review.comments && <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.comments}</p>}
    </div>
  );
}
