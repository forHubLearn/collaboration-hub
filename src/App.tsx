import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useRole } from '@/lib/useStore';
import { seedData } from '@/lib/store';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Inventory from '@/pages/Inventory';
import Taxes from '@/pages/Taxes';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AppLayout() {
  const { role, setRole } = useRole();

  useEffect(() => { seedData(); }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={role} onRoleChange={setRole} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-2 shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard role={role} />} />
              <Route path="/pos" element={<POS role={role} />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/taxes" element={role === 'admin' ? <Taxes /> : <Navigate to="/" />} />
              <Route path="/analytics" element={role === 'admin' ? <Analytics /> : <Navigate to="/" />} />
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
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
