import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useRevalidator,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import createSupabaseClient from "../utils/supabase.server"
import { SupabaseClient } from "@supabase/supabase-js";
import {createBrowserClient} from "@supabase/auth-helpers-remix";

import type { Database } from "db_types";

type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
}

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({request}: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  }

  const response = new Response();
  const supabase = createSupabaseClient({request, response})

  const {data: {session}} = await supabase.auth.getSession();

  return json({env, session}, {headers: response.headers})
}

export default function App() {
  const {env, session} = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [supabase] = useState(() => 
      createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  //debugger
  const serverAccessToken = session?.access_token

  useEffect(() => {
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      if (serverAccessToken && session?.access_token !== serverAccessToken) {
        //debugger;
        if (revalidator.state === "idle") {
          revalidator.revalidate();
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, serverAccessToken, revalidator]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{supabase}} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}