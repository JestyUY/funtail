import Dialog from "@/app/components/dialog-modal";
import AlbumCreatorDialog from "@/app/components/album-creator-dialog";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect("/signin-auto");
  }

  return <AlbumCreatorDialog userId={session.user.id} />;
  //   <header className="text-white flex w-full justify-between px-10 py-2">
  // <div></div>
  // <button className="border rounded-md border-indigo-200 p-1 bg-indigo-800 bg-opacity-5  ">New Album</button>
  //   </header>
}
