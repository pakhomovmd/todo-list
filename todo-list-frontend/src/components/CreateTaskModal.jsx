import { useState, useEffect } from "react";
import { Modal, Input, DatePicker, Button, Select, message } from "antd";
import dayjs from "dayjs";
import {API} from 'D:/study/Praktika/todo-list-frontend/src/api/api';

const { TextArea } = Input;
const { Option } = Select;

export default function CreateTaskModal({ visible, onCancel, projectId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  // Загружаем все доступные теги
  useEffect(() => {
    API.get("/tags/all")
      .then((res) => setTagOptions(res.data))
      .catch(() => message.error("Failed to load tags"));
  }, []);

const handleCreateTag = async () => {
  if (!newTagName.trim()) return;
  try {
    const res = await API.post("/tags/", { name: newTagName });
    //setSelectedTags([...selectedTags, res.data.id]);
    setNewTagName("");
    const res1 = await API.get("/tags/all");
    setTagOptions(res1.data);
  } catch (err) {
    console.error("Failed to create tag", err);
  }
};

  const handleCreate = async () => {
    if (!title.trim()) {
      return message.error("Title is required");
    }

    setLoading(true);

    try {
      // 1. Создаём задачу
      const taskRes = await API.post("/tasks/", {
        title,
        description,
        deadline,
        project_id: projectId,
      });

      const taskId = taskRes.data.id;

      // 2. Привязываем выбранные теги
      await Promise.all(
        selectedTags.map((tagId) =>
          API.post("/task-tags/", { task_id: taskId, id: tagId })
        )
      );

      message.success("Task created!");
      onCancel();
    } catch (err) {
      message.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title="Create New Task"
      footer={null}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <DatePicker
          style={{ width: "100%" }}
          placeholder="Deadline"
          value={deadline ? dayjs(deadline) : null}
          onChange={(value) => setDeadline(value ? value.format("YYYY-MM-DDTHH:mm:ss") : null)}
        />
        <Select
          mode="multiple"
          placeholder="Select tags"
          value={selectedTags}
          onChange={setSelectedTags}
          style={{ width: "100%" }}
          options={tagOptions.map((tag) => ({
            label: tag.name,
            value: tag.id,
          }))}
        />
        <div className="flex gap-2 mt-2">
            <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
            />
            <Button onClick={handleCreateTag}>Add tag</Button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleCreate}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
