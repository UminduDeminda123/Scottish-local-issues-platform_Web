import { useEffect, useState } from 'react';
import { ManagedUser } from '../types';
import { api } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

export function AdminUserPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'council' | 'admin'>('council');
  const [council, setCouncil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!name || !email || !password || (role === 'council' && !council)) {
      setError('Name, email, password, and council name are required for council accounts');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createAdminUser({
        name,
        email,
        password,
        role,
        council: role === 'council' ? council : undefined,
      });

      setName('');
      setEmail('');
      setPassword('');
      setCouncil('');
      setRole('council');
      setSuccess('User created successfully');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create staff account</CardTitle>
          <CardDescription>Add council officers or new admins without using phpMyAdmin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value: 'council' | 'admin') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="council">Council</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'council' && (
            <div className="space-y-2">
              <Label>Council</Label>
              <Input
                value={council}
                onChange={(e) => setCouncil(e.target.value)}
                placeholder="City of Edinburgh Council"
              />
            </div>
          )}

          <Button className="w-full" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing staff accounts</CardTitle>
          <CardDescription>Admins and council users already in the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
              No staff accounts found.
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-slate-600">{user.email}</div>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                {user.council && <div className="mt-2 text-sm text-slate-600">{user.council}</div>}
                {user.createdAt && (
                  <div className="mt-2 text-xs text-slate-500">
                    Created {new Date(user.createdAt).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
