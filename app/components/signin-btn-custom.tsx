"use client"

import { OAuthProviderType } from "next-auth/providers";
import { signIn } from "next-auth/react";

export default function SigninBtnCustom({provider} : {provider: {
    id: OAuthProviderType,name:string}}) {
return (
    <button onClick={()=> signIn(provider.id)}>sign in with {provider.name}</button>
)
}