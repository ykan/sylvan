import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { get } from '@vercel/edge-config'
import { Nav } from './nav'
import { Resume } from './resume'
import { ResumeData } from './type'
import './globals.css'

export const metadata: Metadata = {
  title: "ykan's resume",
  description: "ykan's resume",
}

async function getResumeData(locale: string): Promise<ResumeData | undefined> {
  // if (process.env.NODE_ENV === 'development') {
  //   const devJson = await import('./tmp_resume.json')
  //   const devData =
  //     locale === 'zh'
  //       ? devJson.default['resumeZH']
  //       : devJson.default['resumeEN']
  //   return devData as ResumeData
  // }
  // 生产环境用 edge-config
  return get(locale === 'zh' ? 'resumeZH' : 'resumeEN')
}
const supportLocale = ['zh', 'en']
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale && supportLocale.includes(locale)) {
    const resumeData = await getResumeData(locale)
    if (resumeData) {
      return (
        <html lang={locale}>
          <body>
            <div className="w-[1050px] mx-auto pb-10">
              <Nav locale={locale} />
              <div className="shadow-2xl">
                <Resume data={resumeData} />
              </div>
            </div>
          </body>
        </html>
      )
    }
  }
  redirect('/')
}
