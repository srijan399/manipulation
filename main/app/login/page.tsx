"use client";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Component() {
    return (
        <div className="m-auto text-center border-2 shadow-md p-4">
            <p className="text-center text-2xl font-bold">
                <strong>SIGN IN:</strong>
            </p>
            <p>
                Google: <br />
            </p>
            <GoogleComponent />
            <p>
                Github: <br />
            </p>
            <GithubComponent />
            <p>
                Reddit: <br />
            </p>
            <RedditComponent />
        </div>
    );
}

const GoogleComponent = () => {
    const { data: session } = useSession();
    return (
        <main>
            <section className="m-auto flex flex-col gap-2 items-center">
                {!session && (
                    <>
                        <p>Not signed in</p>
                        <Button onClick={() => signIn("google")}>
                            Sign in with Google
                        </Button>
                    </>
                )}
            </section>
            <section className="m-auto flex flex-col gap-2 items-center">
                {session && (
                    <div className="m-auto w-[80vw] flex-col items-center text-center gap-2">
                        <p>Signed in as {session?.user?.email}</p>
                        <Button onClick={() => signOut()}>Sign out</Button>
                        <p>
                            Full session object:
                            <br />
                            {JSON.stringify(session?.user, null, 2)}
                        </p>

                        <Image
                            src={session.user?.image ?? "/default-avatar.png"}
                            alt="User Image"
                            width={100}
                            height={100}
                        />
                    </div>
                )}
            </section>
        </main>
    );
};

const GithubComponent = () => {
    const { data: session } = useSession();
    return (
        <main>
            <section className="m-auto flex flex-col gap-2 items-center">
                {!session && (
                    <>
                        <p>Not signed in</p>
                        <Button onClick={() => signIn("github")}>
                            Sign in with GitHub
                        </Button>
                    </>
                )}
            </section>
            <section className="m-auto flex flex-col gap-2 items-center">
                {session && (
                    <div className="m-auto w-[80vw] flex-col items-center text-center gap-2">
                        <p>Signed in as {session?.user?.email}</p>
                        <Button onClick={() => signOut()}>Sign out</Button>
                        <p>
                            Full session object:
                            <br />
                            {JSON.stringify(session?.user, null, 2)}
                        </p>

                        <Image
                            src={session.user?.image ?? "/default-avatar.png"}
                            alt="User Image"
                            width={100}
                            height={100}
                        />
                    </div>
                )}
            </section>
        </main>
    );
};

const RedditComponent = () => {
    const { data: session } = useSession();
    return (
        <main>
            <section className="m-auto flex flex-col gap-2 items-center">
                {!session && (
                    <>
                        <p>Not signed in</p>
                        <Button onClick={() => signIn("reddit")}>
                            Sign in with Reddit
                        </Button>
                    </>
                )}
            </section>
            <section className="m-auto flex flex-col gap-2 items-center">
                {session && (
                    <div className="m-auto w-[80vw] flex-col items-center text-center gap-2">
                        <p>Signed in as {session?.user?.email}</p>
                        <Button onClick={() => signOut()}>Sign out</Button>
                        <p>
                            Full session object:
                            <br />
                            {JSON.stringify(session, null, 2)}
                        </p>

                        <Image
                            src={session.user?.image ?? "/default-avatar.png"}
                            alt={session?.user?.name || "user avatar"}
                            width={100}
                            height={100}
                        />
                    </div>
                )}
            </section>
        </main>
    );
};
