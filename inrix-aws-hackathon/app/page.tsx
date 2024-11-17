import Link from "next/link";
import { cookies } from "next/headers";
import { Home } from '@/components/homepage/homepage';
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

export default async function Page() {
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
    <div>
      <Home groups={groupsJson} allGroups={allGroups}></Home>
    </div>
  );
}
