import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { siteSettings } from '@/lib/siteSettings';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const ok = login(password);
    if (ok) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">{siteSettings.siteName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!password}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
