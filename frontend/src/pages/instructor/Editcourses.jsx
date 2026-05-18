import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "DevOps",
  "Cybersecurity",
  "OOPs",
  "Java",
  "Python",
  "JavaScript",
  "Other",
];

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  });
  const [isCourseActive, setIsCourseActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch("/instructor-api/courses", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const found = data.payload.find((course) => course._id === id);
        if (!found) throw new Error("Course not found");
        setForm({
          title: found.title,
          category: found.category,
          content: found.content,
        });
        setIsCourseActive(found.isCourseActive);
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setError("Title is required");
    if (!form.content.trim()) return setError("Description is required");

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/instructor-api/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId: id,
          title: form.title,
          category: form.category,
          content: form.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Course updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    setError("");
    const newState = !isCourseActive;
    const endpoint = newState ? "activate" : "deactivate";

    try {
      const res = await fetch(`/instructor-api/courses/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId: id, isCourseActive: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsCourseActive(newState);
      setSuccess(`Course ${newState ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <main className="app-page">
      <section className="app-container-sm max-w-3xl">
        <Link
          to="/instructor/dashboard"
          className="mb-8 inline-block text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
        >
          ← Dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-eyebrow">Edit Course</p>
            <h1 className="app-title">Update Details</h1>
            <p className="app-subtitle">Keep your course information clear and current.</p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`h-11 rounded-lg border px-4 text-sm font-bold shadow-sm transition-all disabled:opacity-50 ${
              isCourseActive
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {toggling ? "Updating..." : isCourseActive ? "Deactivate Course" : "Activate Course"}
          </button>
        </div>

        <div
          className={`mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
            isCourseActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isCourseActive ? "bg-emerald-500" : "bg-slate-400"}`} />
          {isCourseActive ? "Currently active - visible to students" : "Currently inactive - hidden from students"}
        </div>

        <div className="app-panel space-y-6 p-6">
          <Field label="Course Title">
            <input type="text" name="title" value={form.title} onChange={handleChange} className={inputCls} />
          </Field>

          <Field label="Category">
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Course Description">
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs leading-5 text-blue-800">
              Tip: Chapter editing can be added later. For now, create a new course if the lesson structure needs major changes.
            </p>
          </div>

          {error && <div className="app-error">{error}</div>}
          {success && <div className="app-success">✓ {success}</div>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link to="/instructor/dashboard" className="app-button-secondary flex-1">
              Cancel
            </Link>
            <button type="button" onClick={handleSave} disabled={saving} className="app-button-primary flex-1">
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <div className="app-loader" />
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
