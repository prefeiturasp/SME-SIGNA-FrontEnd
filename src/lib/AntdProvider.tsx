"use client";

import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";

interface AntdProviderProps {
    readonly children: React.ReactNode;
}

const AntdProvider = ({ children }: AntdProviderProps) => {
    return (
        <StyleProvider layer>
            <ConfigProvider
                locale={ptBR}
                theme={{
                    components: {
                        Alert: {
                            withDescriptionPadding: "8px 12px",
                            colorTextHeading: "#B7A100",
                            colorWarningBorder: "#fffbe6",
                        },
                        Tabs: {
                            horizontalMargin: "0 0 32px 0",
                            cardBg: "#F1F5F9",
                        },
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
        </StyleProvider>
    );
};

export default AntdProvider;
