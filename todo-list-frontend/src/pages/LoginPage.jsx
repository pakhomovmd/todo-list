import React from 'react';
import { loginApi } from 'D:/study/Praktika/todo-list-frontend/src/api/api.js';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const { username, password } = values;

    try {
      const res = await loginApi({ username, password });
      const token = res.data.access_token;
      const decoded = jwtDecode(token);

      login({ username: decoded.username, token });
      message.success('Successful!');
      navigate('/');
    } catch (err) {
      message.error('Login error');
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to ToDoList</h2>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please enter your username' }]}
        >
          <Input placeholder="Your username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password placeholder="Your password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
