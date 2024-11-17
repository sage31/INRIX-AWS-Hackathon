import Link from "next/link";

export default function Login() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-serif">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-7xl font-bold ">Scrapbook</h1>
        <p className="text-xl">Connecting Groups, One Photo at a Time.</p>

        <div className="login_box flex items-center justify-center p-8">
          <form
            className="flex flex-col gap-4 w-full max-w-sm"
            action="/api/auth"
            method="POST"
          >
            <label htmlFor="email" className="text-sm font-medium text-red-900">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              className="login_box-input text-red-900"
            />

            <label
              htmlFor="password"
              className="text-sm font-medium text-red-900"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              className="login_box-input text-red-900"
            />
            <button type="submit" className="login_box-button">
              Login
            </button>
            <Link
              href="/createAccount"
              className="text-m font-medium text-red-900 text-center"
            >
              Don't have an account? Sign up!
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
