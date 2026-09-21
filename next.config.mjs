/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /**
     * Left out of the bundle, not compiled into it.
     *
     * ffmpeg-static's index.js is one line of path.join(__dirname, 'ffmpeg'),
     * and webpack rewrites __dirname to the chunk's own folder — so the require
     * succeeds, hands back a path inside .next/server/chunks, and spawn fails
     * with ENOENT on something nothing ever wrote.
     */
    serverComponentsExternalPackages: ['ffmpeg-static'],
    /**
     * And the binary itself is resolved at runtime, so the tracer cannot see
     * that the 80MB file beside index.js is the point of the package. Named
     * for ONE route, so every other function stays the size it was.
     */
    outputFileTracingIncludes: {
      '/api/lesson/audio': ['./node_modules/ffmpeg-static/**'],
    },
  },
}
export default nextConfig
