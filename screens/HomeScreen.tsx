import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,   
  FlatList,
  StyleSheet,
} from "react-native";
import TaskItem from "../components/TaskItem";
import EditTaskModal from "../components/EditTaskModal";
import { Task } from "../types/types";
import { loadTasks, saveTasks } from "../utils/storage";
import { registerForPushNotifications, scheduleNotification, cancelNotification } from "../utils/notifications";

export default function HomeScreen() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // 從AsyncStorage載入任務
  useEffect(() => {
    initializeTasks();
    registerForPushNotifications();
  }, []);

  // 初始化任務
  const initializeTasks = async () => {
    const storedTasks = await loadTasks();
    setTasks(storedTasks);
  };

  // 當任務改變時儲存到AsyncStorage
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

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
  const deleteTask = async (id: string) => {
    // 如有設定提醒，先取消
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete?.reminder) {
      await cancelNotification(id);
    }
    
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
    setIsEditModalVisible(true);
  };

  // 儲存編輯的任務
  const saveEditedTask = async (editedTitle: string, reminderDate: Date | null) => {
    if (!editTask) return;
    
    // 如果之前有設定提醒，先取消
    if (editTask.reminder) {
      await cancelNotification(editTask.id);
    }
    
    setTasks(
      tasks.map((t) =>
        t.id === editTask.id
          ? { ...t, title: editedTitle, reminder: reminderDate }
          : t
      )
    );
    
    // 如果設定了提醒時間，且時間在未來，則安排通知
    if (reminderDate && reminderDate > new Date()) {
      await scheduleNotification(editTask.id, editedTitle, reminderDate);
    }
    
    setIsEditModalVisible(false);
    setEditTask(null);
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
          <TaskItem
            task={item}
            onToggle={toggleCompleted}
            onEdit={openEditModal}
            onDelete={deleteTask}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>目前沒有待辦事項</Text>
        }
      />

      <EditTaskModal
        visible={isEditModalVisible}
        task={editTask}
        onClose={() => setIsEditModalVisible(false)}
        onSave={saveEditedTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 20 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    fontWeight: "bold" 
  },
  inputContainer: { 
    flexDirection: "row", 
    marginBottom: 20 
  },
  input: {
    borderBottomWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#9E9E9E",
    fontSize: 16,
  },
});
