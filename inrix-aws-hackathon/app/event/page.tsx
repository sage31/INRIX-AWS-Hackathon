export default function EventPage() {
    return (
      <div className="flex min-h-screen">
        <div className="sidebar p-4 font-serif">
          <a href="#events" className="sidebar-link active">Events</a>
          <div className="event-buttons">
            <a href="#workshop" className="event-button">Workshop</a>
            <a href="#hackathon" className="event-button">Hackathon</a>
            <a href="#meeting" className="event-button">Meeting</a>
          </div>
          <a href="#createEvent" className="sidebar-link active">Create New Event</a>
        </div>
  
        <div className="flex-1 p-8 font-serif flex flex-col items-center mt-8">
          <header className="mb-4 text-center">
            <h2 className="text-4xl font-bold text-white-900 font-serif">[Club Name]</h2>
            <h3 className="text-2xl font-semibold text-white-700 mt-2">[Event Title]</h3>
            <button className="user-profile absolute top-4 right-4">Profile</button>
            <button className="home-button absolute top-4 right-4">SCUnite</button>
          </header>
  
          <div className="search-bar my-4 font-serif flex justify-center w-full">
            <input
              type="text"
              placeholder="Search for events or photos..."
              className="w-full max-w-xl p-2 rounded-lg border text-red-900"
            />
          </div>
  
          <div className="event-upload-photo mt-6 mb-8 text-center">
            <label htmlFor="event-photo-upload" className="text-lg text-gray-700">Upload Event Photo</label>
            <input
              id="event-photo-upload"
              type="file"
              className="mt-2 p-2 border rounded-lg cursor-pointer"
            />
          </div>
  
          <div className="photo-container mt-8">
            <div className="photo-card">
              <img src="path_to_event_image1.jpg" alt="Description of event photo 1" />
            </div>
            <div className="photo-card">
              <img src="path_to_event_image2.jpg" alt="Description of event photo 2" />
            </div>
            <div className="photo-card">
              <img src="path_to_event_image3.jpg" alt="Description of event photo 3" />
            </div>
          </div>
        </div>
      </div>
    );
  }