import { LayoutDashboard, ShoppingCart, Package, Receipt, BarChart3, Settings, UserCog } from 'lucide-react';
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

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, roles: ['admin', 'sales'] },
  { title: 'POS', url: '/pos', icon: ShoppingCart, roles: ['admin', 'sales'] },
  { title: 'Inventory', url: '/inventory', icon: Package, roles: ['admin', 'sales'] },
  { title: 'Taxes', url: '/taxes', icon: Receipt, roles: ['admin'] },
  { title: 'Analytics', url: '/analytics', icon: BarChart3, roles: ['admin'] },
];

interface AppSidebarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function AppSidebar({ role, onRoleChange }: AppSidebarProps) {
  const { state } = useSidebar();
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <UserCog className="h-3.5 w-3.5" /> Role
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant={role === 'admin' ? 'default' : 'outline'} className="flex-1 text-xs h-7" onClick={() => onRoleChange('admin')}>Admin</Button>
            <Button size="sm" variant={role === 'sales' ? 'default' : 'outline'} className="flex-1 text-xs h-7" onClick={() => onRoleChange('sales')}>Sales</Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
