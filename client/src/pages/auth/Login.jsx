import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { register, handleSubmit, formState } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const user = await login(data.email, data.password);
    if (user.role === "STUDENT") return navigate("/student");
    return navigate("/staff");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">COERTS Login</h1>
        <p className="mt-1 text-sm text-slate-500">Computer Engineering Department</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="email"
              {...register("email", { required: true })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="password"
              {...register("password", { required: true })}
            />
          </div>
          <button
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
            type="submit"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
