import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
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
                Badge: {
                  statusSize: 10,
                },
              },
              token: {
                colorBorder: "#dadada",
                borderRadius: 8,
                fontSize: 14,
                fontWeightStrong: 500,
                controlHeightLG: 40,     
                colorPrimary: "#B22B2A",           
              },
            }}
          >
            {children}
          </ConfigProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
