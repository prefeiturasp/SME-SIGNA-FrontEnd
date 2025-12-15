import type { AppProps } from "next/app";
import "@/styles/globals.css";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryProvider>
      <Component {...pageProps} />
    </ReactQueryProvider>
  );
}