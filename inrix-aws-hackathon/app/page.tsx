import Link from "next/link";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

interface GetUserResponse {
  myGroups: Group[];
  notMyGroups: Group[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  groupPhotoUrl: string;
}

export default async function Home() {
  // UseEffect will only run after the page has loaded
  const cookieStore = await cookies();
  const groupsResp = await fetch("http://localhost:3000/api/user", {
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${cookieStore.get("accessToken")!.value}`,
    },
  });

  let groupsJson = { myGroups: [], notMyGroups: [] } as GetUserResponse;
  let allGroups = [] as Group[];
  if (!groupsResp.ok) {
    console.error("Error fetching user groups");
  } else {
    groupsJson = (await groupsResp.json()) as GetUserResponse;
    allGroups = [...groupsJson.myGroups, ...groupsJson.notMyGroups];
  }

  return (
    <div className="flex">
      <div className="sidebar p-4 font-serif">
        <Link href="/club" className="sidebar-link active">
          My Groups
        </Link>

        <div className="submenu p-4 font-serif">
          {groupsJson!.myGroups.map((group: Group) => (
            <a href="#option" className="submenu-link">
              {group.name}
            </a>
          ))}
        </div>
          
        <a href="#upload" className="sidebar-link active mb-4">
          Other Groups
        </a>
        <div className="submenu p-4 font-serif">
          {groupsJson!.notMyGroups.map((group: Group) => (
            <a href="#option" className="submenu-link">
              {group.name}
            </a>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 font-serif flex flex-col items-center mt-8">
        <header className="mb-4 text-center">
          <h1 className="text-6xl font-bold">Scrapbook</h1>
          <Link href="/profile">
            <button className="user-profile absolute top-4 right-4">
              Profile
            </button>
          </Link>
        </header>

        <div className="search-bar my-4 font-serif flex justify-center w-full">
          <input
            type="text"
            placeholder="Search for clubs or photos..."
            className="w-full max-w-xl p-2 rounded-lg border text-red-900"
          />
        </div>

        <div className="cards mt-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
          {allGroups.map((group: Group) => (
            <div
              key={group.id}
              className="club-cards p-4 bg-white rounded-md shadow-lg cursor-pointer"
            >
              <h2 className="text-m font-semibold text-red-900">
                {group.name}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
