// src/App.jsx
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import ProjectPage from './pages/ProjectPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';

import Header from './components/Header';
import { AuthProvider } from './auth/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <div className="p-6">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Дальше добавим ещё страницы */}
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
