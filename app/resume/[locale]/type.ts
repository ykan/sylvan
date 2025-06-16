export type ResumeData = {
  name: string
  phone: string
  email: string
  location: string
  github: string
  introduction: string

  title: {
    basic: string
    introduction: string
    brief: string
    experience: string
  }
  experiences: Array<{
    title: string
    logo: string
    logoSize?: number
    start: string
    end: string
    desc: string
    projects: Array<{
      desc: string
      tags?: string[]
    }>
    role: string
  }>
}
