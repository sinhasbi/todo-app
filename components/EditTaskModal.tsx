import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,  
} from "react-native";
import { Task } from "../types/types";

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (editedTitle: string, reminderDate: Date | null) => void;
}

const EditTaskModal = ({ visible, task, onClose, onSave }: EditTaskModalProps) => {
  const [editedTitle, setEditedTitle] = useState("");
  const [reminderDate, setReminderDate] = useState<Date | null>(null);

  // 當任務改變時更新表單
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setReminderDate(task.reminder ? new Date(task.reminder) : null);
    }
  }, [task]);

  const handleSave = () => {
    if (editedTitle.trim() === "") return;
    onSave(editedTitle, reminderDate);
  };

  return (
    <Modal
      visible={visible}
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
              onPress={onClose}
            >
              <Text style={styles.buttonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>儲存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default EditTaskModal; 