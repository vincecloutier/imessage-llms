import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getPersonasByUserId, getProfile } from './cached-queries';

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

  // do not run code here (see supabase docs)

  const {data: { user }} = await supabase.auth.getUser()
  
  // just to simplify checks below
  const path = request.nextUrl.pathname

  // notice we specify protected routes explicity since an inverse check 
  // like !== x is too broad and prevents assets/fonts from loading

  // if user is unauthenticated force to '/'
  if (!user && (path.startsWith('/chat') || path.startsWith('/persona') || path.startsWith('/profile'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // if user is authenticated force them to setup a profile 
  if (user && (path.startsWith('/chat') || path.startsWith('/persona') || path === '/')){
    const profile = await getProfile(user.id)
    if (!profile) {
      const url = request.nextUrl.clone()
      url.pathname = '/profile'
      return NextResponse.redirect(url)
    }
  }

  // if user is authenticated force them to set up a persona 
  if (user && (path.startsWith('/chat') || (path.startsWith('/persona') && path !== '/persona/new') || path === '/')){
    const personas = await getPersonasByUserId(user.id)
    if (personas.length === 0) {
      const url = request.nextUrl.clone()
      url.pathname = '/persona/new'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}