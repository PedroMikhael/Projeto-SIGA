"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Calendar, Ticket, Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REST_API_BASE = 'http://127.0.0.1:8000/api/restaurant/';

interface TicketData {
  data: string;
  restaurante: string;
  prato: string;
}

interface Menu {
  id: number;
  day: string;
  mainDish: string;
  side: string;
  dessert: string;
  drink: string;
}

const Restaurant = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Tipo de usuário apenas para exibição no perfil
  const [userType, setUserType] = useState<'student' | 'professor'>('student');

  // ==========================================
  // CONFIGURAÇÃO DE PREÇO ÚNICO
  // ==========================================
  const TICKET_PRICE = 1.00; 

  const weeklyMenu: Menu[] = [
    { id: 100, day: 'Segunda', mainDish: 'Frango Grelhado com Arroz Integral', side: 'Salada de Folhas', dessert: 'Pudim', drink: 'Suco de Laranja' },
    { id: 101, day: 'Terça', mainDish: 'Carne de Panela com Batatas', side: 'Legumes Salteados', dessert: 'Gelatina', drink: 'Suco de Maracujá' },
    { id: 102, day: 'Quarta', mainDish: 'Peixe Assado com Farofa', side: 'Salada Tropical', dessert: 'Mousse', drink: 'Suco de Abacaxi' },
    { id: 103, day: 'Quinta', mainDish: 'Strogonoff de Frango', side: 'Salada Caesar', dessert: 'Doce de Leite', drink: 'Suco de Goiaba' },
    { id: 104, day: 'Sexta', mainDish: 'Feijoada Completa', side: 'Couve e Farofa', dessert: 'Laranja', drink: 'Suco de Limão' },
  ];

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayMenu = dayOfWeek >= 1 && dayOfWeek <= 5 ? weeklyMenu[dayOfWeek - 1] : weeklyMenu[0];

  // --- Recuperar dados do usuário ---
  const getUserData = () => {
    const userStr = localStorage.getItem('user_data');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      if (!user.matricula || !user.type) return null;
      return { matricula: user.matricula, tipo: user.type };
    } catch (e) {
      return null;
    }
  };

  // --- Buscar saldo e tickets ---
  const fetchBalanceAndTickets = async (matricula: string, tipo: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${REST_API_BASE}balance/?matricula=${matricula}&tipo=${tipo}`);
      const data = await res.json();
      
      if (res.ok) {
        setBalance(Number(data.saldo)); 
        setTickets(data.historico_tickets || []);
      } else {
        console.error(data.error);
      }
    } catch (error: any) {
      console.error("Erro ao buscar dados do RU:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Comprar ticket ---
  const handleBuyTicket = async () => {
    const user = getUserData();
    if (!user) {
        toast({ title: 'Erro', description: 'Usuário não logado.', variant: 'destructive' });
        return;
    }

    if (balance < TICKET_PRICE) {
        toast({ title: 'Saldo Insuficiente', description: `O ticket custa R$ ${TICKET_PRICE.toFixed(2)}`, variant: 'destructive' });
        return;
    }

    try {
      const res = await fetch(`${REST_API_BASE}buy/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: user.matricula,
          tipo: user.tipo,
          codigo_ru: 1,
          id_cardapio: todayMenu.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast({ 
            title: 'Ticket Comprado!', 
            description: `Código: ${data.ticket_id}`,
            className: "bg-green-600 text-white border-none"
        });
        fetchBalanceAndTickets(user.matricula, user.tipo);
      } else {
        toast({ title: 'Erro na compra', description: data.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Erro na API', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserType(user.tipo as 'student' | 'professor');
      fetchBalanceAndTickets(user.matricula, user.tipo);
    } else {
      toast({ title: "Acesso restrito", description: "Faça login novamente.", variant: "destructive" });
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* HEADER E SALDO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurante Universitário</h1>
          <p className="text-muted-foreground mt-1">
            Perfil: <Badge variant="outline" className="capitalize ml-1">{userType === 'student' ? 'Estudante' : 'Professor'}</Badge>
          </p>
        </div>
        
        <Card className="shadow-sm border border-primary/20 bg-white">
          <CardContent className="p-4 flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saldo Atual</p>
              {loading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-primary mt-1" />
              ) : (
                 <p className="text-2xl font-bold text-gray-900">R$ {balance.toFixed(2)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARDÁPIO DE HOJE + COMPRA */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <div className="bg-primary px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <Utensils className="w-6 h-6 opacity-90" />
            <div>
              <h2 className="text-xl font-bold">Hoje: {todayMenu.day}</h2>
              <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {today.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Detalhes do Prato */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Prato Principal</span>
                    <p className="font-medium text-slate-800 mt-1">{todayMenu.mainDish}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Guarnição</span>
                    <p className="font-medium text-slate-800 mt-1">{todayMenu.side}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Sobremesa</span>
                    <p className="font-medium text-slate-800 mt-1">{todayMenu.dessert}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Bebida</span>
                    <p className="font-medium text-slate-800 mt-1">{todayMenu.drink}</p>
                </div>
              </div>
            </div>

            {/* Ação de Compra */}
            <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6">
              <div className="text-center md:text-right mb-4">
                <p className="text-sm text-muted-foreground">Valor do Ticket (Preço Único)</p>
                <p className="text-4xl font-bold text-primary">R$ {TICKET_PRICE.toFixed(2)}</p>
              </div>
              <Button 
                size="lg" 
                onClick={handleBuyTicket} 
                className="w-full md:w-auto gap-2 text-lg px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                disabled={balance < TICKET_PRICE}
              >
                <Ticket className="w-5 h-5" />
                Comprar Agora
              </Button>
              {balance < TICKET_PRICE && (
                 <p className="text-xs text-red-500 mt-2 font-medium">Saldo insuficiente.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARDÁPIO SEMANAL */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Próximos Dias</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {weeklyMenu.map(menu => (
              <Card 
                key={menu.id} 
                className={`transition-all hover:border-primary/50 ${menu.day === todayMenu.day ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{menu.day}</span>
                    {menu.day === todayMenu.day && <Badge className="text-[10px] px-1 h-5">Hoje</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
                  <div>
                    <span className="font-medium text-gray-700 block">Principal</span>
                    {menu.mainDish}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">Sobremesa</span>
                    {menu.dessert}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* HISTÓRICO DE TICKETS */}
      {tickets.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold text-gray-900">Meus Tickets Recentes</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{ticket.prato}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ticket.restaurante}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                           {new Date(ticket.data).toLocaleDateString('pt-BR')}
                        </Badge>
                        <span className="text-[10px] text-green-600 font-medium">Pago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant;