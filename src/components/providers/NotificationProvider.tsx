"use client";
import { notification } from "antd";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

type NotificationContextData = {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
};


const NotificationContext =
  createContext({} as NotificationContextData);

export function NotificationProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [api, contextHolder] =
    notification.useNotification();

  const notificationProps = useMemo(() => {
    return {
      placement: "topRight" as const,
      duration: 5,
      closeIcon: null,
    };
  }, []);

  const success = useCallback(function success(
    message: string,
    description?: string
  ) {
    api.success({
      message,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const error = useCallback(function error(
    message: string,
    description?: string
  ) {
    api.error({
      message,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const warning = useCallback(function warning(
    message: string,
    description?: string
  ) {
    api.warning({
      message,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const info = useCallback(function info(
    message: string,
    description?: string
  ) {
    api.info({
      message,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);
  
  const contextValue = useMemo(() => {
    return {
      success,
      error,
      warning,
      info,
    };
  }, [success, error, warning, info]);

  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export function useAppNotification() {
  return useContext(NotificationContext);
}