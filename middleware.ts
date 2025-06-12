import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.RESUME_KEY)
export async function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('jwt') || ''
  let isVerified = false
  try {
    const { payload } = await jwtVerify(token, secret)
    isVerified = Boolean(payload)
  } catch (error) {
    console.log(error)
  }
  if (!isVerified) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/resume/:path*'],
}
