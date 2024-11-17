export default function ProfilePage() {
    return (
      <div className="flex min-h-screen">
        <div className="sidebar p-4 font-serif">
          <a href="#clubs" className="sidebar-link active">Clubs</a>
          <div className="club-buttons">
            <a href="#club1" className="club-button">Club 1</a>
            <a href="#club2" className="club-button">Club 2</a>
            <a href="#club3" className="club-button">Club 3</a>
          </div>
        </div>
  
        <div className="flex-1 p-8 font-serif flex flex-col items-center mt-8">
          <header className="mb-4 text-center relative">
            <h2 className="text-4xl font-bold text-white-900 font-serif">[Profile Name]</h2>
          </header>
  
          <div className="search-bar my-4 font-serif flex justify-center w-full">
            <input
              type="text"
              placeholder="Search for clubs or events..."
              className="w-full max-w-xl p-2 rounded-lg border text-red-900"
            />
          </div>
  
          <button className="homep-button absolute top-4 right-4">SCUnite</button>
  
          <div className="photo-container mt-8">
            <div className="photo-card">
              <img src="path_to_profile_photo1.jpg" alt="Profile Photo 1" />
            </div>
            <div className="photo-card">
              <img src="path_to_profile_photo2.jpg" alt="Profile Photo 2" />
            </div>
            <div className="photo-card">
              <img src="path_to_profile_photo3.jpg" alt="Profile Photo 3" />
            </div>
          </div>
        </div>
      </div>
    );
  }