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
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
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
    title: string,
    description?: string
  ) {
    api.success({
      title,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const error = useCallback(function error(
    title: string,
    description?: string
  ) {
    api.error({
      title,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const warning = useCallback(function warning(
    title: string,
    description?: string
  ) {
    api.warning({
      title,
      description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const info = useCallback(function info(
    title: string,
    description?: string
  ) {
    api.info({
      title,
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