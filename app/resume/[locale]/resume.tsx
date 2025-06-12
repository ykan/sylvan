'use client'
import * as React from 'react'
import Image from 'next/image'
import { type ResumeData } from './type'

type ResumeProps = {
  data: ResumeData
}
export function Resume({ data }: ResumeProps) {
  console.log('Resume data:', data)
  return (
    <div id="resume" className="flex">
      <div className="w-[300px] p-4 grid gap-4">
        <div>
          <div className="font-bold">{data.title.basic}</div>
          <div>{data.name}</div>
          <div>{data.phone}</div>
          <div>{data.email}</div>
        </div>
        <div className="grid gap-4">
          <div className="font-bold">{data.title.brief}</div>
          {data.experiences.map((exp) => (
            <div key={exp.title} className="flex items-center">
              <div className="w-[40px] h-[40px] flex items-center justify-center">
                <Image
                  className="opacity-80"
                  src={`/${exp.logo}`}
                  width={exp.logoSize || 40}
                  height={exp.logoSize || 40}
                  alt={exp.title}
                />
              </div>
              <div className="ml-4 flex-1">
                <div>{exp.title}</div>
                <div>
                  {exp.start} - {exp.end}
                </div>
                <div>{exp.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-[200px]">
          <Image
            className="opacity-80"
            src="/wordcloud.png"
            width={300}
            height={200}
            alt="word cloud"
          />
        </div>
      </div>
      <div className="flex-1 border-l p-4">
        <div className="font-bold">{data.title.experience}</div>
      </div>
    </div>
  )
}
