import { useState, useEffect } from "react";
import { Modal, Select, Button, message } from "antd";
import { API } from "D:/study/Praktika/todo-list-frontend/src/api/api";

export default function AddExistingTaskModal({ visible, onCancel, projectId, onTaskAdded }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем все задачи (можно фильтровать на бэке: например, exclude project_id=...)
  useEffect(() => {
    if (visible) {
      API.get("/tasks/all") // <- настроить этот эндпоинт на бэке, чтобы отдавал нужные задачи
        .then((res) => setTasks(res.data))
        .catch(() => message.error("Failed to load tasks"));
    }
  }, [visible]);

  const handleAddTasks = async () => {
    if (selectedTaskIds.length === 0) {
      return message.warning("Pick at least one task");
    }

    setLoading(true);

    try {
      await Promise.all(
        selectedTaskIds.map((taskId) =>
          API.post(`/projects/${projectId}/tasks?task_id=${taskId}`)
        )
      );

      message.success("Tasks added successfully");
      onTaskAdded?.(); // обновить список задач
      onCancel(); // закрыть модалку
    } catch (err) {
      console.error(err);
      message.error("Failed to add tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title="Add existing tasks"
      footer={null}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4">
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select tasks"
          value={selectedTaskIds}
          onChange={setSelectedTaskIds}
          options={tasks.map((task) => ({
            label: task.title,
            value: task.id,
          }))}
        />

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleAddTasks}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}
