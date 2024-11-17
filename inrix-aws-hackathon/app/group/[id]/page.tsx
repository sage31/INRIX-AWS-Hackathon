
import Link from 'next/link'
import { cookies } from 'next/headers'


interface GetGroupResponse {
  groupId: number;
  name: string;
  description: string;
  groupPhotoUrl: string;
  members: string[];
  events: Event[];
}

interface Event {
  eventId: number;
  name: string;
  description: string;
  eventDate: string;
  location: string;
  photos: Photo[];
  attendees: string[];
}

interface Photo {
  photoId: number;
  photoUrl: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  usersInPhoto: string[];
}


export default async function ClubsPage(params: any) {
  const cookieStore = await cookies();
  const groupResp = await fetch(`http://localhost:3000/api/group?groupId=${(await params.params).id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${cookieStore.get("accessToken")!.value}`,
    },
  });

  let group = (await groupResp.json()) as GetGroupResponse;


  return (
    <div className="flex min-h-screen">
      <div className="sidebar p-4 font-serif">
        <Link href="/createEvent" className="sidebar-link active">Create New Event</Link>
      </div>

      <div className="flex-1 p-8 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h2 className="text-4xl font-bold text-white-900 font-serif">Club Name</h2>
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

        <div className="photo-container mt-8">
          {group.events.map((event) => (
            <div key={event.eventId} className="photo-card">
              <h2 className="text-4xl font-bold text-red-900 font-serif">{event.name}</h2>
              {event.photos && event.photos.length > 0 ? (
                <img
                  src={event.photos[0].photoUrl}
                  alt={`First photo from ${event.name}`}
                />
              ) : (
                <p>No photo available</p>
              )}
              <div className="mt-2 space-y-1">
                <p className="text-sm text-red-900">{event.description}</p>
                <p className="text-sm text-red-900">{event.location}</p>
              </div>
            </div>
          )
          )
          };
        </div>
      </div>
    </div>
  );
}