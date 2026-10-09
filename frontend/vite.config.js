import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        categorias: resolve(__dirname, 'categorias.html'),
        empleado: resolve(__dirname, 'empleado.html'),
        empleadoSistemas: resolve(__dirname, 'empleado_sistemas.html'),
      },
    },
  },
});