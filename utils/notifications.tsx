import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

// 設置通知處理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 註冊通知權限
export const registerForPushNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    Alert.alert('提醒', '無法發送通知，請在設定中開啟通知權限。');
    return false;
  }

  return true;
};

// 安排通知
export const scheduleNotification = async (id: string, title: string, date: Date): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "待辦事項提醒",
      body: title,
      data: { taskId: id },
    },
    trigger: {
      seconds: Math.floor((date.getTime() - Date.now()) / 1000),
      channelId: 'default',
    },
  });
  Alert.alert("提醒已設定", `將在 ${date.toLocaleString()} 提醒您。`);
};

// 取消特定通知
export const cancelNotification = async (taskId: string): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.taskId === taskId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};
