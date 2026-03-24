import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please enter email and password', variant: 'destructive' });
      return;
    }
    const user = login(email, password);
    if (user) {
      toast({ title: 'Welcome!', description: `Logged in as ${user.name}` });
      navigate('/');
    } else {
      toast({ title: 'Login Failed', description: 'Invalid credentials or account disabled', variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BuildMat POS</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@store.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="h-4 w-4 mr-2" /> Sign In
            </Button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-secondary text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo Accounts:</p>
            <p>Admin: admin@store.com / admin123</p>
            <p>Sales: sales@store.com / sales123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
