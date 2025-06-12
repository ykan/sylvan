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

type PageProps = {
  children: React.ReactNode
  params: {
    locale: string
  }
}

const supportLocale = ['zh', 'en']
export default async function Page({ params }: PageProps) {
  const { locale } = await params
  if (locale && supportLocale.includes(locale)) {
    const resumeData = await get<ResumeData>(
      locale === 'zh' ? 'resumeZH' : 'resumeEN'
    )
    if (resumeData) {
      return (
        <html lang={locale}>
          <body>
            <div className="w-[1000px] mx-auto">
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
