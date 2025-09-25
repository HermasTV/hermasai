"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

interface ConfigData {
  pythonServicesUrl: string;
  adminUsername: string;
  adminPassword: string;
  lastUpdated: string;
  updatedBy: string;
}

export default function AdminControlPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Configuration state
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [pythonServicesUrl, setPythonServicesUrl] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        setIsAuthenticated(true);
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
          setPythonServicesUrl(data.config.pythonServicesUrl);
          setAdminUsername(data.config.adminUsername);
          // Don't populate password field for security
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        checkAuthStatus(); // Load configuration
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
      setConfig(null);
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pythonServicesUrl: pythonServicesUrl.trim(),
          adminUsername: adminUsername.trim() || undefined,
          adminPassword: adminPassword.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setSaveMessage('Configuration saved successfully! Changes will be applied within 5 minutes.');
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setSaveMessage('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const testUrl = async () => {
    if (!pythonServicesUrl.trim()) return;

    try {
      const testUrlFormatted = pythonServicesUrl.endsWith('/')
        ? pythonServicesUrl + 'health'
        : pythonServicesUrl + '/health';

      const response = await fetch(testUrlFormatted, { method: 'GET' });
      const isHealthy = response.ok;

      setSaveMessage(isHealthy
        ? '✅ URL is reachable and service is healthy'
        : '⚠️ URL is reachable but service may not be fully operational'
      );
    } catch (error) {
      setSaveMessage('❌ URL is not reachable or service is down');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/30">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/30">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
              <p className="text-gray-300">Enter your credentials to access configuration settings</p>
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
              <p className="text-gray-300">Manage runtime configuration settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Configuration Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-blue-400">⚙️</span>
              Configuration Settings
            </h2>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Python Services URL
                  <span className="text-gray-500 ml-2">(Backend API endpoint)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={pythonServicesUrl}
                    onChange={(e) => setPythonServicesUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="http://127.0.0.1:8000"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={testUrl}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Test URL
                    </button>
                    <span className="text-xs text-gray-400 flex items-center">
                      Will check /health endpoint
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Credentials Section */}
              <div className="border-t border-gray-600/30 pt-6">
                <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <span>🔐</span>
                  Admin Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ⚠️ Changing credentials will require you to log in again with the new credentials.
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>

                {config && (
                  <div className="text-sm text-gray-400">
                    Last updated: {new Date(config.lastUpdated).toLocaleString()}
                  </div>
                )}
              </div>

              {saveMessage && (
                <div className={`p-4 rounded-lg text-sm ${
                  saveMessage.includes('Error') || saveMessage.includes('❌')
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : saveMessage.includes('⚠️')
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                  {saveMessage}
                </div>
              )}
            </form>

            {/* Current Configuration Display */}
            {config && (
              <div className="mt-8 pt-6 border-t border-gray-600/30">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Current Configuration</h3>
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Python Services URL:</span>
                    <span className="text-white font-mono text-sm">{config.pythonServicesUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admin Username:</span>
                    <span className="text-white font-mono text-sm">{config.adminUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admin Password:</span>
                    <span className="text-gray-500 text-sm">••••••••••</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-gray-300">{new Date(config.lastUpdated).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated By:</span>
                    <span className="text-gray-300">{config.updatedBy}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Panel */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">ℹ️ Information</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Configuration is stored in DynamoDB for persistence across deployments</li>
              <li>• Changes are applied automatically within 5 minutes</li>
              <li>• No application rebuild or restart required</li>
              <li>• All projects using Python services will use the new URL</li>
              <li>• Admin credentials are securely stored and hashed</li>
              <li>• No .env file needed - everything managed through this panel</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}