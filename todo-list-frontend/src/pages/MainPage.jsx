// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import {API} from 'D:/study/Praktika/todo-list-frontend/src/api/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/projects/')
      .then(res => setProjects(res.data))
      .catch(() => message.error('Failed to load projects'));
  }, []);

  const handleJoin = async (projectId) => {
    try {
      // Вызывай здесь свой /assignments/ или нужный API
      message.success(`Joined project ${projectId}`);
    } catch {
      message.error('Failed to join project');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Title level={2}>Projects</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} title={project.name} variant={false} className="rounded-xl shadow-md">
            <p className="mb-4 text-gray-700">{project.description}</p>
            <div className="flex gap-2">
              <Button type="primary" onClick={() => navigate(`/projects/${project.id}`)}>
                View
              </Button>
              <Button onClick={() => handleJoin(project.id)}>Join</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
