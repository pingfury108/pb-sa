'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      // 登录成功，authData 和登录状态已自动存储在 pb.authStore 中
      console.log('Authenticated:', authData);
      console.log('Authentication Status:', pb.authStore.isValid);
      if (pb.authStore.isValid) {
        // 确保将认证状态保存到 cookie
        document.cookie = pb.authStore.exportToCookie();
        router.refresh(); // 刷新路由缓存以更新认证状态
        router.push('/'); // 使用 push 而不是 replace，这样用户可以使用浏览器的后退功能
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            登录账户
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
