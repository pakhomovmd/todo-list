// src/components/AssignUserModal.jsx
import { useState, useEffect } from "react";
import { Modal, Select, Button, message } from "antd";
import { API } from "../api/api";

export default function AssignUserModal({ visible, onCancel, taskId, onAssigned }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      API.get("/users/all")
        .then((res) => setUsers(res.data))
        .catch(() => message.error("Failed to load users"));
    }
  }, [visible]);

  const handleAssign = async () => {
    if (!selectedUserId) return message.warning("Please select a user");
    setLoading(true);
    try {
      await API.post("/assignments/", {
        user_id: selectedUserId,
        task_id: taskId,
      });
      message.success("User assigned");
      onAssigned?.(); // callback to refresh task
      onCancel();
    } catch {
      message.error("Failed to assign user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Assign User to Task"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Select
        style={{ width: "100%" }}
        placeholder="Select user"
        value={selectedUserId}
        onChange={setSelectedUserId}
        options={users.map((user) => ({
          value: user.id,
          label: user.username,
        }))}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" loading={loading} onClick={handleAssign}>
          Assign
        </Button>
      </div>
    </Modal>
  );
}
