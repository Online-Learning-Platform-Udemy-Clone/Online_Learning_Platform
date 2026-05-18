import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const hasCertificateAccess = (enrollment) => {
  const coursePrice = Number(enrollment?.course?.price || 0);
  const payment = enrollment?.payment;
  const paymentAmount = typeof payment === "object" ? Number(payment?.amount || 0) : 0;
  const paymentStatus = typeof payment === "object" ? payment?.status : null;

  return coursePrice > 0 || (paymentAmount > 0 && paymentStatus === "SUCCESS");
};

export default function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetch("/student-api/course", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load certificate");

        const found = (data.payload || []).find((item) => (item.course?._id ?? item.course) === courseId);
        if (!found) throw new Error("Course enrollment not found");
        if (found.status !== "Completed") {
          navigate(`/student/learn/${courseId}`);
          return;
        }
        if (!hasCertificateAccess(found)) {
          navigate(`/student/payment/${courseId}`, { state: { certificate: true } });
          return;
        }
        setEnrollment(found);
      } catch (err) {
        setError(err.message || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="app-loader" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-page">
        <section className="app-container-sm">
          <div className="app-error">{error}</div>
        </section>
      </main>
    );
  }

  const course = enrollment?.course;
  const studentName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";
  const completedDate = enrollment?.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : "Recently";
  const certificateId = `LH-${courseId.slice(-6).toUpperCase()}-${(enrollment?._id || "").slice(-6).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 print:bg-white">
      <div className="mx-auto mb-5 flex max-w-5xl items-center justify-between print:hidden">
        <Link to="/student/dashboard" className="text-sm font-bold text-blue-700">
          Back to dashboard
        </Link>
        <button type="button" onClick={() => window.print()} className="app-button-primary">
          Download / Print
        </button>
      </div>

      <section className="mx-auto max-w-5xl border-[10px] border-slate-900 bg-white p-10 shadow-xl print:shadow-none">
        <div className="border-2 border-slate-300 px-8 py-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-blue-700">Certificate of Completion</p>
          <h1 className="mt-8 text-5xl font-black text-slate-950">LearnHub</h1>
          <p className="mt-8 text-lg text-slate-600">This certificate is proudly presented to</p>
          <h2 className="mt-4 text-4xl font-black text-slate-950">{studentName}</h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-700">
            for successfully completing the course
          </p>
          <h3 className="mx-auto mt-4 max-w-3xl text-3xl font-black text-blue-700">{course?.title}</h3>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            <CertificateMeta label="Category" value={course?.category || "Course"} />
            <CertificateMeta label="Completed On" value={completedDate} />
            <CertificateMeta label="Certificate ID" value={certificateId} />
          </div>
        </div>
      </section>
    </main>
  );
}

function CertificateMeta({ label, value }) {
  return (
    <div className="border-t border-slate-300 pt-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
