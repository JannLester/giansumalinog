import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        projects: 'projects.html',
        cProgramming: 'c-programming.html',
        contact: 'contact.html',
        java: 'java.html',
        packetTracer: 'packet-tracer.html',
        skills: 'skills.html',
        web: 'web.html'
      }
    }
  }
});
