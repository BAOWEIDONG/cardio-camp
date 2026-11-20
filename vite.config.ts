import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 从 .env 读取配置（.env / .env.production 等），VITE_ 前缀以外系统变量亦可访问
  const env = loadEnv(mode, process.cwd(), '');
  // 部署基础路径：默认 /versionall/（GitHub Pages 子路径），部署到根目录或自定义域名时通过 .env 的 VITE_BASE 覆盖
  const base: string = env.VITE_BASE || process.env.VITE_BASE || '/cardio-camp/';
  return {
    base,
    plugins: [
      vue(),
      tailwindcss(),
      // 演示环境不启用 PWA 缓存：避免微信里旧 Service Worker 继续命中旧版本导致页面打不开
      VitePWA({ selfDestroying: true }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
