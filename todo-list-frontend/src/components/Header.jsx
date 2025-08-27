// src/components/Header.jsx
import React from 'react';
import { useState } from "react";
import { Link } from 'react-router-dom';
import { Button, Layout} from 'antd';
import { LogoutOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import CreateTaskModal from "./CreateTaskModal";
import ProfilePage from "D:/study/Praktika/todo-list-frontend/src/pages/ProfilePage.jsx";

export default function Header() {
    const { user, logout } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-gray-800">TaskTracker</Link>

      <nav className="flex items-center gap-4">
        <Link to="/tasks">
            <Button type="link">Tasks</Button>
          </Link>
        <div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Create Task
          </Button>
        </div>
        {user ? (
          <>
            <span className="text-gray-700">Hi, 
                <Link to="/profile">
                <Button
                    icon={<UserOutlined />}
                >
                    {user.username}
                </Button>
                </Link>
            </span>
            <Button
              icon={<LogoutOutlined />}
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button type="link">Login</Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Register</Button>
            </Link>
          </>
        )}
      </nav>
    </header>

    <CreateTaskModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
    />        
    </>
  );
}
