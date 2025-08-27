import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Button, Input, message } from "antd";
import { API } from "../api/api";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import AssignUserModal from "../components/AssignUserModal"; // ✅ Импорт


export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [assignModalVisible, setAssignModalVisible] = useState(false); // ✅ Состояние


  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/detail/${id}`); // или /tasks/${id}
      setTask(res.data);
    } catch {
      message.error("Failed to fetch task");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/tasks/${id}/comments`);
      setComments(res.data);
    } catch {
      message.error("Failed to fetch comments");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await API.post(`/tasks/${id}/comments`, { content: newComment, author_id: 1 });
      setNewComment("");
      fetchComments();
      message.success("Comment added");
    } catch {
      message.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
  try {
    await API.delete(`/tasks/${id}/comments/${commentId}`);
    message.success("Comment deleted");
    fetchComments(); // обновить список
  } catch {
    message.error("Failed to delete comment");
  }
};

  if (!task) return null;

  return (
    <div className="p-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card title={task.title} className="mt-4">
        <p>{task.description}</p>
        <p>
          Deadline: {task.deadline ? task.deadline.slice(0, 10) : "None"}
        </p>
        <p>Assigned to: {task.assignees?.[0]?.username || "None"}</p>
        <Button type="default" onClick={() => setAssignModalVisible(true)}>
          Assign User
        </Button>


        <h3 className="mt-6">Comments</h3>
        <List
  dataSource={comments}
  renderItem={(comment) => (
    <List.Item
      key={comment.id}
      actions={[
        <Button
          type="link"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteComment(comment.id)}
          danger
        >
          Delete
        </Button>
      ]}
    >
      <List.Item.Meta
        title={comment.author?.username || "Anonymous"}
        description={comment.content}
      />
    </List.Item>
  )}
/>

        <Input.TextArea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          className="mt-4"
        />
        <Button type="primary" onClick={handleAddComment} className="mt-2">
          Add Comment
        </Button>
      </Card>

      <AssignUserModal
  visible={assignModalVisible}
  onCancel={() => setAssignModalVisible(false)}
  taskId={id}
  onAssigned={fetchTask}
/>
    </div>
  );
}
