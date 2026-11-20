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
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: '心脑血管防治营',
          short_name: '心脑血管防治营',
          description: '北大医疗国际医院 · 心脑血管防治营',
          theme_color: '#1A577C',
          background_color: '#F3F8FC',
          display: 'standalone',
          scope: base,
          start_url: base,
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
      }),
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
