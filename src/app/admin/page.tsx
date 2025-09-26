"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

export default function AdminControlPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/30">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
              <p className="text-gray-300">Enter your credentials to access system information</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/30">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
              <p className="text-gray-300">System configuration overview</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Environment Configuration Display */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-green-400">📊</span>
              Current Configuration
            </h2>

            <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">🔗 Service URLs</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Python Services:</span>
                      <span className="text-white font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                        {process.env.PYTHON_SERVICES_URL || 'http://127.0.0.1:8000'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">🔐 Admin Access</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                        {process.env.ADMIN_USERNAME || 'admin'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Password:</span>
                      <span className="text-gray-500 text-sm">••••••••••</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Management Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">ℹ️ Configuration Management</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Configuration is managed via environment variables</li>
              <li>• Changes require updating environment variables and redeploying</li>
              <li>• Current values are shown above for reference</li>
              <li>• Environment variables needed:</li>
            </ul>
            <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
              <pre className="text-xs text-green-400 font-mono">
{`PYTHON_SERVICES_URL=http://your-backend.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password`}
              </pre>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}