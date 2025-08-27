import React, { useEffect, useState } from "react";
import { Card, List, Typography, Divider, message } from "antd";
import { API } from "../api/api";
import { useAuth } from "../auth/AuthContext";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await API.get(`/users/${user.username}/stats`);
        setStats(res.data);
      } catch {
        message.error("Failed to load user stats");
      }
    };

    const fetchRecentTasks = async () => {
      try {
        const res = await API.get(`/tasks?user=${user.username}&limit=5&sort=recent`);
        setRecentTasks(res.data);
      } catch {
        message.error("Failed to load recent tasks");
      }
    };

    fetchStats();
    fetchRecentTasks();
  }, [user]);

  if (!user) return <div>Please login to view your profile</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title level={2}>Profile: {user.username}</Title>

      <Card title="Statistics" style={{ marginBottom: 24 }}>
        {stats ? (
          <>
            <Text>Created Tasks: {stats.createdTasks}</Text><br />
            <Text>Completed Tasks: {stats.completedTasks}</Text><br />
            <Text>Active Tasks: {stats.activeTasks}</Text><br />
            <Text>Projects Joined: {stats.projectsCount}</Text>
          </>
        ) : (
          <Text>Loading stats...</Text>
        )}
      </Card>

      <Card title="Recent Tasks">
        <List
          dataSource={recentTasks}
          renderItem={task => (
            <List.Item key={task.id}>
              <List.Item.Meta
                title={task.title}
                description={task.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
