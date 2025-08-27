// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import {API} from 'D:/study/Praktika/todo-list-frontend/src/api/api';
import { useAuth } from '../auth/AuthContext';
import { jwtDecode } from 'jwt-decode';


const { Title } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // логин сразу после регистрации

const onFinish = async (values) => {
  setLoading(true);
  try {
    await API.post('/users/register', values);

    const tokenResponse = await API.post('/login', new URLSearchParams({
      username: values.username,
      password: values.password,
    }));

    const decoded = jwtDecode(tokenResponse.data.access_token);
    // decoded.sub — у тебя там id, decoded.username — если есть
    login({ username: decoded.username || values.username, token: tokenResponse.data.access_token });

    message.success('Successful registration');
    navigate('/'); // на главную
  } catch (error) {
    message.error('Registration failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-xl rounded-2xl">
      <Title level={2}>Register</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input placeholder="Your username" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input placeholder="Your email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password placeholder="Create a password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
