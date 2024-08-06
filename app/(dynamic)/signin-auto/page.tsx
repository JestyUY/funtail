import SignInButtons from "./SignInButtons";

export default function SignIn() {
  return (
    <main className="flex  justify-center mt-28">
      <div className="p-10 bg-java-100 rounded-md border-java-300 border-4">
        <h2 className="pb-4 font-medium text-java-950 text-xl">
          Sign in to continue:{" "}
        </h2>
        <SignInButtons />
      </div>
    </main>
  );
}
