'use client'
import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type NavProps = {
  locale: string
}
export function Nav({ locale }: NavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLanguageChange = (checked: boolean) => {
    const newPath = checked
      ? pathname.replace('/en', '/zh')
      : pathname.replace('/zh', '/en')
    const jwt = searchParams.get('jwt')
    if (jwt) {
      router.push(`${newPath}?jwt=${jwt}`)
      return
    }
  }

  return (
    <div className="flex flex-row-reverse p-4 items-center">
      <Switch
        className="mx-2"
        checked={locale === 'zh'}
        onCheckedChange={handleLanguageChange}
      />
      <Label>{locale === 'zh' ? '中文' : 'English'}</Label>
    </div>
  )
}
