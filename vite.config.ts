import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // 커스텀 도메인 se3c.mcv.kr에 맞게 절대 경로로 변경
})
