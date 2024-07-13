
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth()
    if(!session) {
        redirect("/signin-auto")
    }
    return <div>{session.user.name}
    <h2>here we going to display the dashboard itself, with create album functionality aswell as showing existing albums</h2>
    </div>
}