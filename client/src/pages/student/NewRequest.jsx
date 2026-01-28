import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function NewRequest() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState } = useForm({
    defaultValues: {
      requestType: "OVERLOAD",
      semester: "",
      subjects: [],
    },
  });

  const [subjects, setSubjects] = useState([
    { code: "", title: "", schedule: "" },
  ]);

  const requestType = watch("requestType");

  const addSubject = () => {
    setSubjects([...subjects, { code: "", title: "", schedule: "" }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        requestType: data.requestType,
        semester: data.semester,
        subjects: subjects.filter((s) => s.code && s.title),
      };

      await api.post("/requests", payload);
      navigate("/student");
    } catch (error) {
      console.error("Failed to create request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/student")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">New Enrollment Request</h2>
        <p className="mt-1 text-gray-600">
          Submit a request for subject overload, override, or manual tagging.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Request Type */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Request Type</h3>
          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition ${
                requestType === "OVERLOAD"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="OVERLOAD"
                {...register("requestType")}
                className="mt-1 h-5 w-5 text-red-600"
              />
              <div>
                <p className="font-semibold text-gray-800">Subject Overload</p>
                <p className="text-sm text-gray-600">
                  Request to take more than the allowed units
                </p>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition ${
                requestType === "OVERRIDE"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="OVERRIDE"
                {...register("requestType")}
                className="mt-1 h-5 w-5 text-red-600"
              />
              <div>
                <p className="font-semibold text-gray-800">Subject Override</p>
                <p className="text-sm text-gray-600">
                  Request to enroll in a closed or restricted section
                </p>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition ${
                requestType === "MANUAL_TAGGING"
                  ? "border-red-600 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value="MANUAL_TAGGING"
                {...register("requestType")}
                className="mt-1 h-5 w-5 text-red-600"
              />
              <div>
                <p className="font-semibold text-gray-800">Manual Tagging</p>
                <p className="text-sm text-gray-600">
                  Request to manually add a subject to your enrollment
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Semester */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Semester</h3>
          <select
            {...register("semester", { required: true })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">Select semester</option>
            <option value="1st Sem 2025-2026">1st Sem 2025-2026</option>
            <option value="2nd Sem 2025-2026">2nd Sem 2025-2026</option>
            <option value="Summer 2026">Summer 2026</option>
            <option value="1st Sem 2026-2027">1st Sem 2026-2027</option>
          </select>
        </div>

        {/* Subjects */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              Requested Subjects ({subjects.length})
            </h3>
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
          </div>

          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Subject {index + 1}
                  </p>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CMPE 401"
                      value={subject.code}
                      onChange={(e) =>
                        updateSubject(index, "code", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Database Management Systems"
                      value={subject.title}
                      onChange={(e) =>
                        updateSubject(index, "title", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Schedule
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., MWF 08:00-09:30"
                      value={subject.schedule}
                      onChange={(e) =>
                        updateSubject(index, "schedule", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex-1 rounded-lg bg-red-800 py-3 font-semibold text-white hover:bg-red-900 disabled:opacity-50"
          >
            {formState.isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
