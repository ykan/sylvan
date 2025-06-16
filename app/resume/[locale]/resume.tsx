'use client'
import * as React from 'react'
import Image from 'next/image'
import { Mail, Github, Smartphone, MapPin } from 'lucide-react'
import { type ResumeData } from './type'

type ResumeProps = {
  data: ResumeData
}
export function Resume({ data }: ResumeProps) {
  return (
    <div id="resume" className="flex h-[1985px]">
      <div className="w-[300px] px-5 py-10 grid gap-4">
        <div>
          <h1 className="text-4xl pb-5">{data.name}</h1>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone size={20} />
            <span>{data.phone}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Mail size={20} />
            <span>{data.email}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Github size={20} />
            <span>{data.github}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span>{data.location}</span>
          </div>
        </div>
        <div className="grid gap-4">
          <h2 className="text-2xl">{data.title.brief}</h2>
          {data.experiences.map((exp) => (
            <div key={exp.title} className="flex items-center">
              <div className="w-[40px] h-[40px] flex items-center justify-center">
                <Image
                  className="opacity-75"
                  src={`/${exp.logo}`}
                  width={exp.logoSize || 40}
                  height={exp.logoSize || 40}
                  alt={exp.title}
                />
              </div>
              <div className="ml-4 flex-1">
                <div>{exp.title}</div>
                <div className="text-xs text-gray-500">
                  {exp.start} - {exp.end}
                </div>
                <div>{exp.role}</div>
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
      <div className="flex-1 border-l px-5 py-10">
        <h2 className="text-2xl">{data.title.introduction}</h2>
        <div className="pb-5">{data.introduction}</div>
        <h2 className="text-2xl">{data.title.experience}</h2>
        <div>
          {data.experiences
            .filter((it) => it.projects)
            .map((exp) => (
              <div key={exp.title}>
                <h3 className="text-lg">
                  {exp.title}[{exp.start} - {exp.end}]
                </h3>
                <div className="flex">{exp.desc}</div>
                <div>
                  {exp.projects.map((project) => (
                    <div key={project.desc} className="border-b py-2">
                      <div className="font-semibold">{project.desc}</div>
                      <div className="text-xs text-gray-500">
                        {project.tags?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
