import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { seedData } from '@/lib/store';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Inventory from '@/pages/Inventory';
import Taxes from '@/pages/Taxes';
import Analytics from '@/pages/Analytics';
import Sales from '@/pages/Sales';
import UserManagement from '@/pages/UserManagement';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const { user } = useAuth();

  useEffect(() => { seedData(); }, []);

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-2 shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard role={role} />} />
              <Route path="/pos" element={<POS role={role} />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/taxes" element={<RequireAdmin><Taxes /></RequireAdmin>} />
              <Route path="/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
              <Route path="/sales" element={<RequireAdmin><Sales /></RequireAdmin>} />
              <Route path="/my-sales" element={<Sales restrictedMode />} />
              <Route path="/users" element={<RequireAdmin><UserManagement /></RequireAdmin>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
