import { LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3, Users, LogOut, DollarSign } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLowStockMaterials } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, roles: ['admin', 'sales'] },
  { title: 'POS', url: '/pos', icon: ShoppingCart, roles: ['admin', 'sales'] },
  { title: 'Inventory', url: '/inventory', icon: Package, roles: ['admin', 'sales'] },
  { title: 'Sales', url: '/sales', icon: DollarSign, roles: ['admin'] },
  { title: "My Sales", url: '/my-sales', icon: DollarSign, roles: ['sales'] },
  { title: 'Taxes', url: '/taxes', icon: Receipt, roles: ['admin'] },
  { title: 'Analytics', url: '/analytics', icon: BarChart3, roles: ['admin'] },
  { title: 'Users', url: '/users', icon: Users, roles: ['admin'] },
];

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const lowStock = getLowStockMaterials().length;
  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider">
              BuildMat POS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} className="hover:bg-accent/50 flex items-center gap-2" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="flex-1">{item.title}</span>}
                      {!collapsed && item.title === 'Inventory' && lowStock > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">{lowStock}</Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground mb-2">
            <p className="font-medium text-foreground">{user?.name}</p>
            <p>{user?.email}</p>
            <Badge variant="secondary" className="text-xs mt-1">{role.toUpperCase()}</Badge>
          </div>
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={logout}>
            <LogOut className="h-3 w-3 mr-1" /> Sign Out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
