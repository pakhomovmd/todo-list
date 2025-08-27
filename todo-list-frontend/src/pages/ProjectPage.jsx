import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, List, Checkbox, Tag, Modal, Input, message } from "antd";
import {API} from 'D:/study/Praktika/todo-list-frontend/src/api/api';
import { ArrowLeftOutlined, UserAddOutlined, PlusOutlined } from "@ant-design/icons";
import AddExistingTaskModal from "D:/study/Praktika/todo-list-frontend/src/components/AddExistingTaskModal.jsx";

export default function ProjectPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserId, setNewUserId] = useState("");

    const [showExistingModal, setShowExistingModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, []);

  const fetchProject = async () => {
    const res = await API.get(`/projects/${id}`);
    setProject(res.data);
    setMembers(res.data.members || []);
  };

  const fetchTasks = async () => {
    const res = await API.get(`/tasks/${id}`);
    setTasks(res.data);
  };

  const handleAddUser = async () => {
    try {
      await API.post(`/projects/${id}/add_user?user_id=${newUserId}`);
      message.success("User added to project");
      setNewUserId("");
      setIsAddUserModalOpen(false);
      fetchProject(); // обновить список участников
    } catch (err) {
      message.error("Error adding user");
    }
  };

  const handleToggleTaskCompleted = async (taskId, checked) => {
  try {
    await API.patch(`/tasks/${taskId}`, { completed: checked });
    // Обновляем локально состояние tasks, чтобы сразу показать изменения
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: checked } : task
      )
    );
    if (checked) {
      message.success("Task completed!");
    } else {
      message.info("Task uncompleted");
    }
  } catch (err) {
    message.error("Failed to update task");
  }
};

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
          Back
        </Button>

        <div className="flex gap-2">
          <Button icon={<UserAddOutlined />} onClick={() => setIsAddUserModalOpen(true)}>
            Add User
          </Button>
          <Button  icon={<PlusOutlined />} onClick={() => setShowExistingModal(true)} type="primary" >
            Add Task
          </Button>
          <AddExistingTaskModal
            visible={showExistingModal}
            onCancel={() => setShowExistingModal(false)}
            projectId={project ? project.id : null}
            onTaskAdded={fetchTasks} // или fetchTasks — что у тебя обновляет список
        />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">{project?.name}</h1>
      <p className="text-gray-600 mb-4">{project?.description}</p>

      <h2 className="text-lg font-semibold mb-2">Members</h2>
      <div className="mb-4">
        <List
          dataSource={members}
          renderItem={(user) => <List.Item>{user.username}</List.Item>}
        />
      </div>

      <h2 className="text-lg font-semibold mb-2">Tasks</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            title={
              <div className="flex justify-between items-center">
                <span>{task.title}</span>
                <Checkbox
                    checked={task.completed}
                    onChange={(e) => handleToggleTaskCompleted(task.id, e.target.checked)}
                />
              </div>
            }
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

      <Modal
        open={isAddUserModalOpen}
        title="Add User to Project"
        onCancel={() => setIsAddUserModalOpen(false)}
        onOk={handleAddUser}
        okText="Add"
      >
        <Input
          placeholder="Enter User ID"
          value={newUserId}
          onChange={(e) => setNewUserId(e.target.value)}
        />
      </Modal>
    </div>
  );
}
