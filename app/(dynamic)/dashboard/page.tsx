import Dialog from "@/app/components/dialog-modal";
import AlbumCreatorDialog from "@/app/components/album-creator-dialog";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import Albums from "@/app/components/albums";

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect("/signin-auto");
  }

  return (
    <main className="flex p-8">
      <Albums userId={session.user.id} />;
    </main>
  );
}
