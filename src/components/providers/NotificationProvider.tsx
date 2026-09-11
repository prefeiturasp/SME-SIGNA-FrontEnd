"use client";
import { notification } from "antd";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

type NotificationMessageParams = {
  title: string;
  description?: string;
  clearPrevious?: boolean;
};


type NotificationContextData = {
  success: (
    notification: NotificationMessageParams,
  ) => void;
  error: (
    notification: NotificationMessageParams,
  ) => void;
  warning: (
    notification: NotificationMessageParams,
  ) => void;
  info: (
    notification: NotificationMessageParams,
  ) => void;
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
    notification: NotificationMessageParams,
 
  ) {
    if (notification.clearPrevious) api.destroy();

    api.success({
      title: notification.title,
      description: notification.description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const error = useCallback(function error(
    notification: NotificationMessageParams,
 
  ) {
    if (notification.clearPrevious) api.destroy();

    api.error({
      title: notification.title,
      description: notification.description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const warning = useCallback(function warning(
    notification: NotificationMessageParams,
 
  ) {
    if (notification.clearPrevious) api.destroy();

    api.warning({
      title: notification.title,
      description: notification.description,
      ...notificationProps,
    });
  }, [api, notificationProps]);

  const info = useCallback(function info(
    notification: NotificationMessageParams,
    
  ) {
    if (notification.clearPrevious) api.destroy();

    api.info({
      title: notification.title,
      description: notification.description,
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