import { useEffect, useState } from 'react';
import { User, Issue, IssueStatus } from './types';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { HomePage } from './components/HomePage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { CouncilDashboard } from './components/CouncilDashboard';
import { Toaster, toast } from './components/ui/sonner';
import { api } from './services/api';

type AuthView = 'home' | 'login' | 'signup';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [view, setView] = useState<AuthView>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const fetchedIssues = await api.getIssues();
      setIssues(fetchedIssues);

      if (!api.getToken()) {
        return;
      }

      const { user: currentUser } = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Initialization error:', error);
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshIssues = async () => {
    const fetchedIssues = await api.getIssues();
    setIssues(fetchedIssues);
  };

  const handleLogin = async (newUser: User) => {
    setUser(newUser);
    await refreshIssues();
    toast.success(`Welcome, ${newUser.name}!`);
  };

  const handleLogout = async () => {
    api.clearToken();
    setUser(null);
    setView('home');
    await refreshIssues();
    toast.success('Logged out successfully');
  };

  const handleSignupSuccess = () => {
    setView('login');
    toast.success('Account created successfully. Please log in.');
  };

  const handleReportIssue = async (issueData: Omit<Issue, 'id' | 'reportedAt' | 'updatedAt' | 'priority' | 'votes'>) => {
    try {
      const newIssue = await api.createIssue(issueData);
      setIssues((prev) => [newIssue, ...prev]);
      toast.success('Issue reported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to report issue');
    }
  };

  const handleUpdateIssue = async (issueId: string, newStatus: IssueStatus, notes?: string) => {
    try {
      const updatedIssue = await api.updateIssueStatus(issueId, newStatus, notes);
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? updatedIssue : issue)));
      toast.success('Issue updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update issue');
    }
  };

  const handleVoteIssue = async (issueId: string) => {
    try {
      const updatedIssue = await api.voteIssue(issueId);
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? updatedIssue : issue)));
      toast.success('Vote added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to vote for issue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {view === 'home' && (
          <HomePage
            issues={issues}
            onLoginClick={() => setView('login')}
            onSignupClick={() => setView('signup')}
          />
        )}
        {view === 'login' && (
          <Login
            onLogin={handleLogin}
            onGoToSignup={() => setView('signup')}
            onBackToHome={() => setView('home')}
          />
        )}
        {view === 'signup' && (
          <Signup
            onSignupSuccess={handleSignupSuccess}
            onBackToLogin={() => setView('login')}
            onBackToHome={() => setView('home')}
          />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      {user.role === 'citizen' ? (
        <CitizenDashboard
          user={user}
          issues={issues}
          onReportIssue={handleReportIssue}
          onVoteIssue={handleVoteIssue}
          onLogout={() => { void handleLogout(); }}
        />
      ) : (
        <CouncilDashboard
          user={user}
          issues={issues}
          onUpdateIssue={handleUpdateIssue}
          onLogout={() => { void handleLogout(); }}
        />
      )}
      <Toaster position="top-right" />
    </>
  );
}
