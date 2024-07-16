"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

type ProvidersType = {
  [key: string]: {
    id: string;
    name: string;
  };
};

export default function SignInButtons() {
  const [providers, setProviders] = useState<ProvidersType | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const fetchedProviders = await getProviders();
      setProviders(fetchedProviders);
    };
    fetchProviders();
  }, []);

  if (!providers) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {Object.values(providers).map((provider) => (
        <div key={provider.name} className="  ">
          <button
            onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
            className=" p-2 rounded-md bg-java-50 hover:bg-java-100 mt-2 border-2 border-java-400"
          >
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </>
  );
}
