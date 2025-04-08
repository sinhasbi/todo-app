import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";

// 設置通知處理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 定義任務類型
interface Task {
  id: string;
  title: string;
  completed: boolean;
  reminder?: Date | null;
}

export default function TaskItem() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [reminderDate, setReminderDate] = useState<Date | null>(null);

  // 從AsyncStorage載入任務
  useEffect(() => {
    loadTasks();
    registerForPushNotifications();
  }, []);

  // 當任務改變時儲存到AsyncStorage
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  // 註冊通知權限
  async function registerForPushNotifications() {
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
      return;
    }
  }

  // 載入任務
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("@tasks");
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("無法載入任務:", error);
    }
  };

  // 儲存任務
  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("@tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("無法儲存任務:", error);
    }
  };

  // 新增任務
  const addTask = () => {
    if (task.trim() === "") return;
    const newTask: Task = { 
      id: Date.now().toString(), 
      title: task,
      completed: false,
      reminder: null
    };
    setTasks([...tasks, newTask]);
    setTask("");
  };

  // 刪除任務
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // 切換任務完成狀態
  const toggleCompleted = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // 開啟編輯模式
  const openEditModal = (task: Task) => {
    setEditTask(task);
    setEditedTitle(task.title);
    setReminderDate(task.reminder ? new Date(task.reminder) : null);
    setIsEditModalVisible(true);
  };

  // 儲存編輯的任務
  const saveEditedTask = () => {
    if (editedTitle.trim() === "") return;
    
    setTasks(
      tasks.map((t) =>
        t.id === editTask?.id
          ? { ...t, title: editedTitle, reminder: reminderDate }
          : t
      )
    );
    
    // 如果設定了提醒時間，且時間在未來，則安排通知
    if (reminderDate && editTask && reminderDate > new Date()) {
      scheduleNotification(editTask.id, editedTitle, reminderDate);
    }
    
    setIsEditModalVisible(false);
    setEditTask(null);
  };

  // 安排通知
  const scheduleNotification = async (id: string, title: string, date: Date) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的待辦清單</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="輸入待辦事項"
          style={styles.input}
          value={task}
          onChangeText={setTask}
        />
        <Button title="新增" onPress={addTask} />
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleCompleted(item.id)}
            >
              <View style={styles.checkbox}>
                {item.completed && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
              </View>
              <Text style={[
                styles.taskText,
                item.completed && styles.completedText
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="pencil" size={20} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* 編輯任務的彈出視窗 */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>編輯待辦事項</Text>
            <TextInput
              style={styles.modalInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
            />
            <View style={styles.reminderContainer}>
              <Text>設定提醒時間：</Text>
              <Button
                title={reminderDate ? reminderDate.toLocaleString() : "選擇時間"}
                onPress={() => {
                  // 設定時間為當前時間加一小時
                  const newDate = new Date();
                  newDate.setHours(newDate.getHours() + 1);
                  setReminderDate(newDate);
                }}
              />
              {reminderDate && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setReminderDate(null)}
                >
                  <Text style={styles.clearButtonText}>清除</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditedTask}
              >
                <Text style={styles.buttonText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  inputContainer: { flexDirection: "row", marginBottom: 20 },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  task: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#9E9E9E",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    marginHorizontal: 5,
  },
  deleteButton: {
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 8,
  },
  reminderContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  clearButton: {
    marginTop: 5,
  },
  clearButtonText: {
    color: "#F44336",
    textAlign: "right",
  },
});
