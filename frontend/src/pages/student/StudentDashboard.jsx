import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLE = {
  Enrolled: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Dropped: "bg-slate-50 text-slate-600 border-slate-200",
};

const hasCertificateAccess = (enrollment) => {
  const coursePrice = Number(enrollment?.course?.price || 0);
  const payment = enrollment?.payment;
  const paymentAmount = typeof payment === "object" ? Number(payment?.amount || 0) : 0;
  const paymentStatus = typeof payment === "object" ? payment?.status : null;

  return coursePrice > 0 || (paymentAmount > 0 && paymentStatus === "SUCCESS");
};

const getEnrollmentProgress = (enrollment) => {
  if (enrollment?.status === "Completed") return 100;

  const progress = Number(enrollment?.progress || 0);
  if (!Number.isFinite(progress)) return 0;

  return Math.min(100, Math.max(0, Math.round(progress)));
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch("/student-api/course", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load courses");
        setEnrollments((data.payload || []).filter((enrollment) => enrollment.course));
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const active = enrollments.filter((item) => item.status !== "Dropped" && item.status !== "Completed");
  const completed = enrollments.filter((item) => item.status === "Completed");
  const dropped = enrollments.filter((item) => item.status === "Dropped");

  return (
    <main className="app-page">
      <section className="app-container">
        <div className="app-section-header">
          <div>
            <p className="app-eyebrow">My learning</p>
            <h1 className="app-title">
              Welcome back, {user?.firstName || "Student"}
            </h1>
            <p className="app-subtitle">
              Track your enrolled, completed, and paused courses from one place.
            </p>
          </div>
          <Link to="/student/courses" className="app-button-primary">
            Browse courses
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Active", value: active.length, color: "text-blue-600" },
            { label: "Completed", value: completed.length, color: "text-emerald-600" },
            { label: "Dropped", value: dropped.length, color: "text-slate-600" },
          ].map((stat) => (
            <div key={stat.label} className="app-stat-card">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label} courses</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Your courses</h2>
          <p className="text-sm text-slate-500">{enrollments.length} total</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="app-loader" />
          </div>
        )}

        {error && <div className="app-error">{error}</div>}

        {!loading && !error && enrollments.length === 0 && (
          <div className="app-card border-dashed px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-950">No courses yet</p>
            <p className="mt-2 text-sm text-slate-500">Enroll in a course to start learning.</p>
            <Link to="/student/courses" className="app-button-primary mt-5">
              Find a course
            </Link>
          </div>
        )}

        {!loading && !error && enrollments.length > 0 && (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EnrollmentCard({ enrollment }) {
  const { course, status } = enrollment;
  const progress = getEnrollmentProgress(enrollment);
  const title = course?.title ?? "Course";
  const category = course?.category ?? "Learning";
  const courseId = course?._id ?? course;
  const certificateLink = hasCertificateAccess(enrollment)
    ? `/student/certificate/${courseId}`
    : `/student/payment/${courseId}`;

  return (
    <article className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
        LH
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-slate-950">{title}</h3>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] ?? STATUS_STYLE.Enrolled}`}>
            {status}
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-500">{category}</p>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium text-slate-500">{progress}%</span>
        </div>
      </div>

      {status === "Completed" ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to={certificateLink}
            state={!hasCertificateAccess(enrollment) ? { certificate: true } : undefined}
            className="app-button-primary"
          >
            Certificate
          </Link>
          <Link to={`/student/review/${courseId}`} className="app-button-secondary">
            Rate
          </Link>
        </div>
      ) : status === "Dropped" ? (
        <span className="text-sm font-medium text-slate-400">Dropped</span>
      ) : (
        <Link to={`/student/learn/${courseId}`} className="app-button-primary shrink-0">
          Continue
        </Link>
      )}
    </article>
  );
}
