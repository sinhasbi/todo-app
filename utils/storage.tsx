import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types/types";

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem("@tasks");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("無法載入任務:", error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]) => {
  try {
    await AsyncStorage.setItem("@tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("無法儲存任務:", error);
  }
};