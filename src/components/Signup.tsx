import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../services/api';

interface SignupProps {
  onSignupSuccess: () => void;
  onBackToLogin: () => void;
  onBackToHome: () => void;
}

export function Signup({ onSignupSuccess, onBackToLogin, onBackToHome }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.signup({ email, password, name });
      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create citizen account</CardTitle>
          <CardDescription>Public signup is only for citizens. Council and admin users are created internally.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>

            <Button className="w-full" size="lg" disabled={loading} onClick={handleSignup}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="flex flex-col items-center gap-1 text-center">
              <Button variant="link" onClick={onBackToLogin} disabled={loading}>
                Already have an account? Back to login
              </Button>
              <Button variant="link" onClick={onBackToHome} disabled={loading}>
                Back to home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
