import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Tag, message } from "antd";
import { API } from "../api/api";
import SelectProjectModal from "../components/SelectProjectModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const res = await API.get("/tasks/all");
      setTasks(res.data);
    } catch (err) {
      message.error("Failed to fetch tasks");
    }
  };

  const handleAddToProjectClick = (taskId) => {
    setSelectedTaskId(taskId);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedTaskId(null);
  };

  const handleTaskAddedToProject = () => {
    message.success("Task successfully added to project");
    // Можно обновить список задач или проектов, если нужно
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleDeleteTask = async (taskId) => {
  try {
    await API.delete(`/tasks/delete/${taskId}`);
    message.success("Task deleted successfully");
    setTasks(tasks.filter((task) => task.id !== taskId)); // обновляем список без удалённой
  } catch (err) {
    message.error("Failed to delete task");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Tasks</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            title={
              <div className="flex justify-between items-center">
                <span>{task.title}</span>
                <Checkbox checked={task.completed} disabled />
              </div>
            }
            actions={[
              <Button key="view" type="link" onClick={() => handleViewTask(task.id)}>View</Button>,
              <Button key="add" type="link" onClick={() => handleAddToProjectClick(task.id)}>Add to Project</Button>,
              <Button key="delete" type="link" danger onClick={() => handleDeleteTask(task.id)}>Delete</Button>,
            ]}
          >
            <p>{task.description}</p>
            <div className="flex justify-between items-end mt-4">
              <span className="text-gray-500 text-sm">
                Deadline: {task.deadline ? task.deadline.slice(0, 10) : "None"}
              </span>
              <span className="text-sm">Assigned: {task.assignees?.[0]?.username || "None"}</span>
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {task.tags?.map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SelectProjectModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        taskId={selectedTaskId}
        onSuccess={handleTaskAddedToProject}
      />
    </div>
  );
}
