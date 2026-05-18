import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getVideoEmbed } from "../../utils/media";

const hasCertificateAccess = (enrollment) => {
  const coursePrice = Number(enrollment?.course?.price || 0);
  const payment = enrollment?.payment;
  const paymentAmount = typeof payment === "object" ? Number(payment?.amount || 0) : 0;
  const paymentStatus = typeof payment === "object" ? payment?.status : null;

  return coursePrice > 0 || (paymentAmount > 0 && paymentStatus === "SUCCESS");
};

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  const saveProgress = useCallback(async (nextProgress) => {
    const safeProgress = Math.min(100, Math.max(0, Math.round(nextProgress)));
    const nextStatus = safeProgress >= 100 ? "Completed" : safeProgress > 0 ? "In Progress" : "Enrolled";

    setEnrollment((prev) => (
      prev ? { ...prev, status: nextStatus, progress: safeProgress } : prev
    ));

    const res = await fetch("/student-api/course", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ courseId: id, status: nextStatus, progress: safeProgress }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update progress");
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollRes] = await Promise.all([
          fetch("/student-api/courses", { credentials: "include" }),
          fetch("/student-api/course", { credentials: "include" }),
        ]);
        const coursesData = await coursesRes.json();
        const enrollData = await enrollRes.json();

        if (!coursesRes.ok) throw new Error(coursesData.message || "Failed to load course");

        const found = coursesData.payload?.find((item) => item._id === id);
        if (!found) throw new Error("Course not found");
        setCourse(found);

        if (enrollRes.ok) {
          const myEnroll = enrollData.payload?.find((item) => (item.course?._id ?? item.course) === id);
          if (!myEnroll) {
            navigate(`/student/courses/${id}`);
            return;
          }
          setEnrollment(myEnroll);
        }
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (!course || !enrollment || enrollment.status === "Completed") return;

    const chapters = course.chapters ?? [];
    if (chapters.length === 0) return;

    const nextProgress = Math.round(((activeChapter + 1) / chapters.length) * 100);
    if (nextProgress <= Number(enrollment.progress || 0)) return;

    saveProgress(nextProgress).catch((err) => {
      setError(err.message || "Failed to update progress");
    });
  }, [activeChapter, course, enrollment, saveProgress]);

  const handleComplete = async () => {
    setCompleting(true);
    setError("");

    try {
      await saveProgress(100);
    } catch (err) {
      setError(err.message || "Failed to update progress");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorView message={error} />;
  if (!course) return null;

  const chapters = course.chapters ?? [];
  const currentChapter = chapters[activeChapter];
  const currentChapterTitle = currentChapter?.title || `Chapter ${activeChapter + 1}`;
  const isCompleted = enrollment?.status === "Completed";
  const certificateAccess = hasCertificateAccess(enrollment);
  const savedProgress = Math.min(100, Math.max(0, Math.round(Number(enrollment?.progress || 0))));
  const progress = isCompleted ? 100 : Math.max(savedProgress, chapters.length ? Math.round(((activeChapter + 1) / chapters.length) * 100) : 0);
  const completedLessons = isCompleted ? chapters.length : Math.min(chapters.length, Math.ceil((progress / 100) * chapters.length));

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/student/dashboard" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Back to My Learning
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{completedLessons} of {chapters.length} lessons viewed</p>
          </div>

          <div className="w-full sm:w-64">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Chapters</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">{course.category || "Course content"}</h2>
            </div>

            <div className="max-h-[calc(100vh-18rem)] overflow-y-auto p-2">
              {chapters.length === 0 && <p className="p-3 text-sm text-slate-500">No lessons are available yet.</p>}
              {chapters.map((chapter, index) => (
                <button
                  key={chapter._id ?? index}
                  type="button"
                  onClick={() => setActiveChapter(index)}
                  className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition ${
                    activeChapter === index ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      activeChapter === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-bold">{chapter.title || `Chapter ${index + 1}`}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {chapter.videoContent ? "Video" : "Notes"}{chapter.documentContent ? " + Doc" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-200 p-4">
              {isCompleted ? (
                <div className="space-y-3">
                  <Link
                    to={certificateAccess ? `/student/certificate/${id}` : `/student/payment/${id}`}
                    state={!certificateAccess ? { certificate: true } : undefined}
                    className="app-button-primary w-full"
                  >
                    Certificate
                  </Link>
                  <Link to={`/student/review/${id}`} className="app-button-secondary w-full">
                    Rate course
                  </Link>
                </div>
              ) : (
                chapters.length > 0 && (
                  <button type="button" onClick={handleComplete} disabled={completing} className="app-button-primary w-full">
                    {completing ? "Marking..." : "Mark as completed"}
                  </button>
                )
              )}
            </div>
          </aside>

          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {chapters.length === 0 ? (
              <div className="flex min-h-[28rem] items-center justify-center text-sm text-slate-500">
                This course has no lessons yet.
              </div>
            ) : (
              <div>
                <p className="app-eyebrow">Chapter {activeChapter + 1} of {chapters.length}</p>
                <h2 className="mb-5 text-2xl font-bold text-slate-950">{currentChapterTitle}</h2>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                  {currentChapter?.videoContent ? (
                    <VideoEmbed url={currentChapter.videoContent} />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-sm font-semibold text-slate-400">
                      No video added for this chapter
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-bold text-slate-950">Chapter Content</h3>
                    {currentChapter?.documentContent && (
                      <a
                        href={currentChapter.documentContent}
                        target="_blank"
                        rel="noreferrer"
                        className="app-button-secondary px-4 py-2 text-sm"
                      >
                        Open Document
                      </a>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-700">
                    {currentChapter?.textContent || "No content added yet."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveChapter((value) => Math.max(0, value - 1))}
                    disabled={activeChapter === 0}
                    className="app-button-secondary"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChapter((value) => Math.min(chapters.length - 1, value + 1))}
                    disabled={activeChapter === chapters.length - 1}
                    className="app-button-primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function VideoEmbed({ url }) {
  const video = getVideoEmbed(url);

  if (!video) return null;

  if (video.type === "iframe") {
    return (
      <iframe
        key={video.src}
        src={video.src}
        title="Chapter video"
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <video
      key={video.src}
      src={video.src}
      controls
      className="aspect-video w-full object-contain"
    />
  );
}

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <div className="app-loader" />
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6">
      <div className="app-panel max-w-sm text-center">
        <p className="text-lg font-semibold text-slate-950">Unable to open lesson</p>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
