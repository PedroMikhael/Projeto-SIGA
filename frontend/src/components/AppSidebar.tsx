import { Home, BookOpen, FileText, Calendar, Settings, Utensils, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AppSidebar() {
  const { user, logout } = useAuth();

  const studentItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Matrícula Online', url: '/dashboard/enrollment', icon: Calendar },
    { title: 'Meu Boletim', url: '/dashboard/grades', icon: FileText },
    { title: 'Histórico Escolar', url: '/dashboard/history', icon: BookOpen },
    { title: 'Restaurante Universitário', url: '/dashboard/restaurant', icon: Utensils },
  ];

  const professorItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Minhas Turmas', url: '/dashboard/classes', icon: BookOpen },
    { title: 'Diário de Classe', url: '/dashboard/classbook', icon: FileText },
    { title: 'Restaurante Universitário', url: '/dashboard/restaurant', icon: Utensils },
  ];

  const adminItems = [
    { title: 'Configurações', url: '/dashboard/admin', icon: Settings },
    { title: 'Relatórios', url: '/dashboard/reports', icon: BarChart3 },
  ];

  const menuItems = user?.type === 'student' ? studentItems : professorItems;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">SIGA</h2>
            <p className="text-xs text-sidebar-foreground/70">Sistema Acadêmico</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {user?.type === 'student' ? 'Menu do Aluno' : 'Menu do Professor'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="rounded-lg">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-sidebar-accent-foreground/20"
          onClick={logout}
        >
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
