import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'
import md5 from 'blueimp-md5'

function validExpireTime(exp: string, sign: string): boolean {
  const secret = process.env.RESUME_KEY
  const signature = md5(`${exp}${secret}`)
  if (sign !== signature) {
    throw new Error('Invalid signature')
  }
  const expireNum = Number(exp)
  const expireTime = dayjs.unix(expireNum)
  if (!expireTime.isValid()) {
    throw new Error('Invalid expire time')
  }
  const currentTime = dayjs().unix()
  return expireNum > currentTime
}

export async function middleware(request: NextRequest) {
  const exp = request.nextUrl.searchParams.get('exp') || ''
  const sign = request.nextUrl.searchParams.get('sign') || ''
  let isVerified = false
  try {
    isVerified = validExpireTime(exp, sign)
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
