import Link from 'next/link';
import PhotoFeed from '../components/PhotoFeed';

export default function ClubsPage() {
  return (
    <div className="flex min-h-screen">
      <div className="sidebar p-4 font-serif">
        <a href="#events" className="sidebar-link active">Events</a>
        <div className="event-buttons">
          <a href="#workshop" className="event-button">Workshop</a>
          <a href="#hackathon" className="event-button">Hackathon</a>
          <a href="#meeting" className="event-button">Meeting</a>
        </div>
        <Link href="/createEvent" className="sidebar-link active">Create New Event</Link>
      </div>

      <div className="flex-1 p-8 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h2 className="text-4xl font-bold text-white-900 font-serif">[Club Name]</h2>
          <Link href="/profile">
            <button className="user-profile absolute top-4 right-4">Profile</button>
          </Link>
          <Link href="/">
            <button className="home-button absolute top-4 right-4">Scrapbook</button>
          </Link>
        </header>

        <div className="search-bar my-4 font-serif flex justify-center w-full">
          <input
            type="text"
            placeholder="Search for events or photos..."
            className="w-full max-w-xl p-2 rounded-lg border text-red-900"
          />
        </div>

        < PhotoFeed />
      </div>
    </div>
  );
}
