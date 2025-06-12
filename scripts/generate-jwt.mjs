// 生成JWT令牌的工具脚本
import { SignJWT } from 'jose'

import { config } from 'dotenv'

config({
  path: '.env.local',
})

// 获取密钥
const secret = new TextEncoder().encode(process.env.RESUME_KEY)

export async function generateJWT(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // 设置过期时间
    .sign(secret)

  console.log('生成的JWT令牌:')
  console.log(token)
  console.log('\n访问链接:')
  console.log(`http://localhost:3000/resume/en?jwt=${token}`)
}

// 生成令牌
generateJWT({
  name: 'resume',
})
