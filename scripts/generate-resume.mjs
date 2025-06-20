// 生成JWT令牌的工具脚本
import md5 from 'blueimp-md5'
import dayjs from 'dayjs'

import { config } from 'dotenv'

config({
  path: '.env.local',
})

function generateResumeUrl() {
  const secret = process.env.RESUME_KEY
  const expireTime = dayjs().add(1, 'd').unix().toString()
  const signature = md5(`${expireTime}${secret}`)
  console.log('生成的JWT令牌:')
  console.log(signature)
  console.log('\n访问链接:')
  console.log(
    `http://localhost:3000/resume/zh?exp=${expireTime}&sign=${signature}`
  )
}

// 生成令牌
generateResumeUrl()
