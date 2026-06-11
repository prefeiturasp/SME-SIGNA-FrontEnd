"use client";
import { notification } from "antd";
import {
  createContext,
  useContext,
  ReactNode,
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
}: {
  children: ReactNode;
}) {
  const [api, contextHolder] =
    notification.useNotification();

  function success(
    message: string,
    description?: string
  ) {
    api.success({
      message,
      description,
      placement: "topRight",
      duration: 3,
      closeIcon: null,
    });
  }

  function error(
    message: string,
    description?: string
  ) {
    api.error({
      message,
      description,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
  }

  function warning(
    message: string,
    description?: string
  ) {
    api.warning({
      message,
      description,
      closeIcon: null,
    });
  }

  function info(
    message: string,
    description?: string
  ) {
    api.info({
      message,
      description,
      closeIcon: null,
    });
  }

  return (
    <NotificationContext.Provider
      value={{
        success,
        error,
        warning,
        info,
      }}
    >
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

export function useAppNotification() {
  return useContext(NotificationContext);
}