export default function Login() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[Arial, Helvetica, sans-serif]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">SCUnite</h1>
        <p className="text-xl">Connecting Groups, One Photo at a Time.</p>

        <div className="login_box flex items-center justify-center p-8">
          <form className="flex flex-col gap-4 w-full max-w-sm">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              className="login-box input"
            />

            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              className="login-box-input"
            />

            <button
              type="submit"
              className="login-box button"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


export function Home() {
  return (
    <div>
    <div className="sidebar">
      <a href="#home" className="sidebar-link active">My Clubs</a>
      <a href="#upload" className="sidebar-link">Upload Photos</a>
      <a href="#profile" className="sidebar-link">Profile</a>
    </div>

    <div className="content">
      <h2>Welcome to SCUnite</h2>
      <p>Here is your dashboard content.</p>
    </div>
  </div>
);
}