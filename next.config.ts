import type { NextConfig } from "next";

// Define the configuration object
const nextConfig: NextConfig = {
  // NOTE: The 'reactCompiler: true' option often requires specific package installations
  // (like babel-plugin-react-compiler) which can lead to build errors if not set up
  // perfectly. We are disabling it temporarily to ensure stable compilation
  // and resolve the 'Failed to resolve package babel-plugin-react-compiler' error.
  reactCompiler: false, 

  // Add any other necessary configurations here
  // For example, if you need to set up environment variables or custom webpack config:
  // experimental: {
  //   serverActions: true,
  // },
};

export default nextConfig;