import {useOutletContext} from "@remix-run/react";
import type { SupabaseOutlookContext } from "../app/root";

export default function Login() {
  const {supabase} = useOutletContext<SupabaseOutlookContext>();

  const handleLogin = async () => {
    console.log("hello")
    const {error} = await supabase.auth.signInWithOAuth({
      provider: "github",
      //options: {
      //  skipBrowserRedirect: true,
      //}
    })

    if (error) {
      console.log(error);
    } else {
      console.log("fooooo")
    }
  }

  const handleLogout = async () => {
    console.log("logout")
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.log(error);
    }
  }

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleLogin}>Login</button>
    </>
  )
}
