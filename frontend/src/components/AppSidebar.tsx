import { 
  Home, 
  BookOpen, 
  FileText, 
  Calendar, 
  Settings, 
  Utensils, 
  BarChart3,
  LogOut // Importando o ícone de logout
} from 'lucide-react';
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
// Removemos o Button padrão daqui, pois faremos um customizado
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
    ...(user?.type !== 'student' 
      ? [{ title: 'Relatórios', url: '/dashboard/reports', icon: BarChart3 }] 
      : []
    ),
  ];

  const menuItems = user?.type === 'student' ? studentItems : professorItems;

  // Pega a inicial do nome ou email
  const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <span className="text-lg font-bold text-primary">S</span>
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

      {/* --- INICIO DAS MUDANÇAS NO FOOTER --- */}
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
        <div className="flex flex-col gap-4">
          
          {/* Informações do Usuário */}
          <div className="flex items-start gap-3">
            {/* MUDANÇA AQUI: Usando as cores do tema (primary) */}
            <Avatar className="h-10 w-10 border border-sidebar-border shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold text-sm text-sidebar-foreground truncate leading-none mt-1">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate leading-none">
                {user?.email}
              </p>
              
              {/* Matrícula */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sidebar-accent border border-sidebar-border/50 mt-1.5">
                <span className="text-[10px] font-medium text-sidebar-foreground/80">
                  Mat: {user?.matricula || "2023..."}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Sair (Danger) */}
          <button
            onClick={logout}
            className="group relative w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md border border-red-100 transition-all duration-200 hover:bg-red-600 hover:text-white hover:shadow-sm active:scale-95 outline-none focus:ring-2 focus:ring-red-200"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </SidebarFooter>
      {/* --- FIM DAS MUDANÇAS NO FOOTER --- */}
    </Sidebar>
  );
}