export type ResumeData = {
  name: string
  phone: string
  email: string
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
  }>
}
