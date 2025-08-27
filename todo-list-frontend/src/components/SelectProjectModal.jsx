import React, { useEffect, useState } from "react";
import { Modal, List, Button, message } from "antd";
import { API } from "../api/api";

export default function SelectProjectModal({ visible, onCancel, taskId, onSuccess }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProjects();
    }
  }, [visible]);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects"); // API для получения всех проектов текущего пользователя
      setProjects(res.data);
    } catch (err) {
      message.error("Failed to load projects");
    }
  };

  const handleAddToProject = async (projectId) => {
    setLoading(true);
    try {
      await API.post(`/projects/${projectId}/tasks?task_id=${taskId}`);
      message.success("Task added to project");
      onSuccess();
      onCancel();
    } catch (err) {
      message.error("Failed to add task to project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Select Project to Add Task"
      onCancel={onCancel}
      footer={null}
    >
      <List
        loading={loading}
        dataSource={projects}
        renderItem={(project) => (
          <List.Item
            actions={[
              <Button
                key="add"
                type="primary"
                onClick={() => handleAddToProject(project.id)}
              >
                Add to Project
              </Button>,
            ]}
          >
            {project.name}
          </List.Item>
        )}
      />
    </Modal>
  );
}
