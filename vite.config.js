import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import pxtovw from 'postcss-px-to-viewport';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import dayjs from 'dayjs';
const loder_pxtovw = pxtovw({
  viewportWidth: 1920,
  viewportUnit: 'vw',
  exclude: [/node_modules/],
});

const version = dayjs().format(`YYYY-MM-DD_HH-mm-ss`);

export default defineConfig(({mode}) => {
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue'],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],

    css: {
      postcss: {
        plugins: [loder_pxtovw],
      },
    },

    resolve: {
      alias: {
        '@': resolve('./src'),
      },
    },

    server: {
      hmr: true,
      usePolling: true,
      port: '8090',
      host: true,
      https: false,
      cors: true, // 默认启用并允许任何源
      open: true, // 在服务器启动时自动在浏览器中打开应用程序
      proxy: {
        '/v1': {
          target: '',
          changeOrigin: true, // 是否跨域
        },
      },
    },

    build: {
      outDir: 'dist', // 指定输出路径
      minify: 'terser', // 混淆器，terser构建后文件体积更小
      brotliSize: true, //压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能
      cssCodeSplit: false, //整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      chunkSizeWarningLimit: 5000, //chunk 大小警告的限制（以 kbs 为单位）
      sourcemap: false, //构建后是否生成 source map 文件
      assetsDir: 'resource', //指定生成静态资源的存放路径
      emptyOutDir: true, //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录
      terserOptions: {
        compress: {
          drop_console: mode === 'build_prod',
          drop_debugger: mode === 'build_prod',
        },
      },
      rollupOptions: {
        output: {
          chunkFileNames: `resource/js/[name]_${version}.js`,
          entryFileNames: `resource/js/[name]_${version}.js`,
          assetFileNames: `resource/[ext]/[name]_${version}.[ext]`,
        },
      },
    },
  };
})
