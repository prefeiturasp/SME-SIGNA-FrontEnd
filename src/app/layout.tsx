import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { Toaster } from "sonner";
import { ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIGNA",
  description: "Teste signa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ReactQueryProvider>
          <ConfigProvider
            locale={ptBR}
            theme={{
              components: {
                Notification: {
                  colorSuccessBg: "#333638",  
                  colorInfoBg: "#333638",  
                  colorErrorBg: "#333638",  
                  colorWarningBg: "#333638",
                  colorText: "#FFFFFF",
                  colorTextHeading: "#FFFFFF",
                },
              },
              token: {
                colorBorder: "#dadada",
                borderRadius: 8,
                fontSize: 14,
                fontWeightStrong: 500,
                controlHeightLG: 40,                
              },
            }}
          >
            {children}
          </ConfigProvider>
        </ReactQueryProvider>
        <Toaster position="top-right" closeButton />
      </body>
    </html>
  );
}
