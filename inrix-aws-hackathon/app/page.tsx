import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex">
      <div className="sidebar p-4 font-serif">
        <a href="#myclubs" className="sidebar-link active">My Clubs</a>
        <div className="submenu p-4 font-serif">
          <a href="#option" className="submenu-link">ACM</a>
          <a href="#option2" className="submenu-link">SWE</a>
        </div>
        <a href="#upload" className="sidebar-link active mb-4">Other Clubs</a>
        <Link href="/login" className="sidebar-link active">
          Login
        </Link>
      </div>

      <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h1 className="text-6xl font-bold">SCUnite</h1>
          <button className="user-profile absolute top-4 right-4">Profile</button>
        </header>
        
        <div className="search-bar my-4 font-serif flex justify-center w-full">
          <input
            type="text"
            placeholder="Search for clubs or photos..."
            className="w-full max-w-xl p-2 rounded-lg border text-red-900"
          />
        </div>

        <div className= "cards mt-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ACM</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">SWE</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ACM-W</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">SHPE</h2>
            </div>

            <div className="club-cards p-4 bg-white rounded-md shadlow-lg cursor-pointer">
              <h2 className = "text-m font-semibold text-red-900">ITW</h2>
            </div>
            </div>
      </div>
    </div>
  );
}