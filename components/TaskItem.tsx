import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem = ({ task, onToggle, onEdit, onDelete }: TaskItemProps) => {
  return (
    <View style={styles.task}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(task.id)}
      >
        <View style={styles.checkbox}>
          {task.completed && <Ionicons name="checkmark" size={18} color="#4CAF50" />}
        </View>
        <Text style={[
          styles.taskText,
          task.completed && styles.completedText
        ]}>
          {task.title}
        </Text>
        {task.reminder && (
          <View style={styles.reminderContainer}>
            <Ionicons name="alarm-outline" size={16} color="#FF9800" />
            <Text style={styles.reminderText}>
              {new Date(task.reminder).toLocaleString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="pencil" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  reminderText: {
    fontSize: 12,
    color: "#FF9800",
    marginLeft: 4,
  },
});

export default TaskItem;
