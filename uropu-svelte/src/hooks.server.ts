import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,AUTH_SECRET } from '$env/static/private';



import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/core/providers/google"
import type { Handle } from "@sveltejs/kit";

export const handle = SvelteKitAuth(async () => {
  const authOptions = {
    providers: [Google({
		clientSecret: GOOGLE_CLIENT_SECRET,
		clientId: GOOGLE_CLIENT_ID,
		  })],
    secret: AUTH_SECRET,
    trustHost: true
  }
  return authOptions
}) satisfies Handle;