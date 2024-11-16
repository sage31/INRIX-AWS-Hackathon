
export function Login() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-serif">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold ">SCUnite</h1>
        <p className="text-xl">Connecting Groups, One Photo at a Time.</p>

        <div className="login_box flex items-center justify-center p-8">
          <form className="flex flex-col gap-4 w-full max-w-sm">
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

            <label htmlFor="password" className="text-sm font-medium text-red-900">
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

            <button
              type="submit"
              className="login_box-button"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <div className="flex">
      <div className="sidebar p-4 font-serif">
        <a href="#home" className="sidebar-link active">My Clubs</a>
        <div className="submenu p-4 font-serif">
          <a href="#option" className="submenu-link">ACM</a>
          <a href="#option2" className="submenu-link">SWE</a>
        </div>
        <a href="#upload" className="sidebar-link">Upload Photos</a>
        <a href="#profile" className="sidebar-link">Profile</a>
      </div>

      <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold">SCUnite</h1>
          <button className="user-profile mt-4">Profile</button>
        </header>
        
        <div className="search-bar my-4 font-serif flex justify-center w-full">
          <input
            type="text"
            placeholder="Search for clubs or photos..."
            className="w-full max-w-xl p-2 rounded-lg border text-red-900"
          />
        </div>

      </div>
    </div>
  );
}
