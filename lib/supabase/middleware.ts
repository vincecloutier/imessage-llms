import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )


  // TODO: remove anon sign-in code
    // // do not run code here (see supabase docs)
    // let { data: { user }, error: getUserError } = await supabase.auth.getUser();

    // // if no user found, try to sign in anonymously
    // if (getUserError || !user) {
    //   console.log('No user session found in middleware, attempting anonymous sign-in.');
    //   const { error: signInError } = await supabase.auth.signInAnonymously();
    //   if (signInError) {
    //     // TODO: handle error by redirecting to an error page or return the response
    //     console.error('Anonymous sign-in failed in middleware:', signInError);
    //   } else {
    //     // if anon sign-in succeeded, update the user again as the cookie should now be set on the 'response' object
    //     const { data: { user: newUser } } = await supabase.auth.getUser();
    //     user = newUser;
    //     console.log('Anonymous sign-in successful in middleware. User ID:', user?.id);
    //   }
    // }

    // // notice we specify protected routes explicity since an inverse check 
    // // like !== x is too broad and prevents assets/fonts from loading

    // // if user is unauthenticated force to '/'
    // if ((!user || user.is_anonymous) && (request.nextUrl.pathname.startsWith('/chat'))) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = '/';
    //   return NextResponse.redirect(url);
    // }


  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith('/chat')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/chat'
    return NextResponse.redirect(url)
  }  

  return supabaseResponse;
}