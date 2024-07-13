import SignOutBtnCustom from "@/app/components/signout-btn-custom"
import SignInBtnCustom from "@/app/components/signin-btn-custom" // Add this import statement
import { auth } from "@/lib/auth"

export default async function Page() {
    const session = await auth()
    if(session) {
     return (
        <div>
            <div>Signed in as: {session.user.name}</div>
            <SignOutBtnCustom/>
        </div>
     )  
    }
return (
    <div>
        <h2>Sign In Custom</h2>
        <SignInBtnCustom provider={{id:"github", name:"GitHub"}}/>
    </div>
)


}