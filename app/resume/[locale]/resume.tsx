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
    <div id="resume" className="flex h-[1985px] px-4">
      <div className="w-[300px] px-6 py-16">
        {/* basic */}
        <div className="pb-6">
          <h1 className="text-4xl pb-6">{data.name}</h1>
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
            <a href={data.githubUrl}>{data.github}</a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span>{data.location}</span>
          </div>
        </div>
        {/* introduction */}
        <h2 className="text-2xl">{data.title.introduction}</h2>
        <div className="pb-6 pt-4">{data.introduction}</div>
        {/* experience */}
        <div className="pb-6">
          <h2 className="text-2xl">{data.title.brief}</h2>
          {data.experiences.map((exp) => (
            <div key={exp.title} className="flex items-center pt-4">
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
        {/* creations */}
        <div className="pb-6">
          <h2 className="text-2xl">{data.title.creations}</h2>
          <ul className="list-disc pl-6 pt-4">
            <li>
              <a href="https://manual.kujiale.com/muya-ui/" target="_blank">
                Muya Design
              </a>
              <span>: 组件库</span>
            </li>
            <li>
              <div>
                <span>RobotImg</span>
                <span>: 图片懒加载组件</span>
              </div>
              <ul className="list-disc pl-6">
                <li>
                  <a href="https://github.com/ykan/robot-img" target="_blank">
                    React 版本
                  </a>
                </li>
                <li>
                  <a href="https://github.com/ykan/robot-img" target="_blank">
                    Vue 版本
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="https://manual.kujiale.com/muya-ui/" target="_blank">
                Little Tree
              </a>
              <span>: pixi.js 小游戏</span>
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <Image
            className="opacity-80"
            src="/wordcloud.png"
            width={300}
            height={200}
            alt="word cloud"
          />
        </div>
      </div>
      <div className="flex-1 border-l px-6 py-16">
        <div>
          {data.experiences
            .filter((it) => it.projects)
            .map((exp) => (
              <div key={exp.title}>
                <h2 className="text-2xl border-b font-bold pb-1">
                  <span className="pr-1">{exp.title}</span>
                  <span className="text-gray-500 text-lg">
                    {exp.start} - {exp.end}
                  </span>
                </h2>
                <div className="pt-4">{exp.desc}</div>
                <ol className="list-decimal pl-6 pb-4">
                  {exp.projects.map((project) => (
                    <li key={project.desc} className="pt-2">
                      <div>{project.desc}</div>
                      <div className="text-xs text-gray-500">
                        {project.tags?.join(', ')}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
