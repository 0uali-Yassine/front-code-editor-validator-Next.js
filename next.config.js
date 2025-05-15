// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
// }

// module.exports = nextConfig
// module.exports = {
//   reactStrictMode: true,
// }

// module.exports = {
//   reactStrictMode: true,
//   images: {
//     domains: [
//       'process.fs.teachablecdn.com',
//       'www.filepicker.io',
//       'teachablecdn.com',
//       'filepicker.io'
//     ],
//   },
// }

module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'process.fs.teachablecdn.com',
      'www.filepicker.io',
      'teachablecdn.com',
      'filepicker.io'
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for the JSX runtime issue with CodeMirror
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    };
    return config;
  },
}