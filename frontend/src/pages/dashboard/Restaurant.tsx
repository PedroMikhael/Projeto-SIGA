import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Calendar, Ticket, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REST_API_BASE = 'http://127.0.0.1:8000/api/restaurant/';

interface Ticket {
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [balance, setBalance] = useState(0);

  const weeklyMenu: Menu[] = [
    { id: 100, day: 'Segunda', mainDish: 'Frango Grelhado com Arroz Integral e Feijão Preto', side: 'Salada de Folhas Verdes', dessert: 'Pudim de Leite', drink: 'Suco de Laranja' },
    { id: 101, day: 'Terça', mainDish: 'Carne de Panela com Batatas', side: 'Legumes Salteados', dessert: 'Gelatina', drink: 'Suco de Maracujá' },
    { id: 102, day: 'Quarta', mainDish: 'Peixe Assado com Arroz e Farofa', side: 'Salada Tropical', dessert: 'Mousse de Chocolate', drink: 'Suco de Abacaxi' },
    { id: 103, day: 'Quinta', mainDish: 'Strogonoff de Frango com Arroz e Batata Palha', side: 'Salada Caesar', dessert: 'Doce de Leite', drink: 'Suco de Goiaba' },
    { id: 104, day: 'Sexta', mainDish: 'Feijoada Completa', side: 'Couve Refogada e Farofa', dessert: 'Laranja', drink: 'Suco de Limão' },
  ];

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayMenu = dayOfWeek >= 1 && dayOfWeek <= 5 ? weeklyMenu[dayOfWeek - 1] : weeklyMenu[0];
  const ticketPrice = 1.0;

  // --- Pegar matrícula e tipo do localStorage ---
  const getUserData = () => {
    const userStr = localStorage.getItem('user_data');
    if (!userStr) {
      toast({ title: 'Usuário não identificado', description: 'Matrícula ou tipo de usuário não encontrado', variant: 'destructive' });
      return null;
    }
    const user = JSON.parse(userStr);
    if (!user.matricula || !user.type) {
      toast({ title: 'Usuário não identificado', description: 'Matrícula ou tipo de usuário não encontrado', variant: 'destructive' });
      return null;
    }
    return { matricula: user.matricula, tipo: user.type };
  };

  // --- Buscar saldo e tickets pelo backend ---
  const fetchBalanceAndTickets = async (matricula: string, tipo: string) => {
    try {
      const res = await fetch(`${REST_API_BASE}balance/?matricula=${matricula}&tipo=${tipo}`);
      const data = await res.json();
      if (res.ok) {
        setBalance(data.saldo);
        setTickets(data.historico_tickets);
      } else {
        toast({ title: 'Erro ao buscar saldo', description: data.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Erro na API', description: error.message, variant: 'destructive' });
    }
  };

  // --- Comprar ticket ---
  const handleBuyTicket = async () => {
    const user = getUserData();
    if (!user) return;

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
        toast({ title: 'Ticket comprado!', description: `Código: ${data.ticket_id}` });
        fetchBalanceAndTickets(user.matricula, user.tipo);
      } else {
        toast({ title: 'Erro ao comprar ticket', description: data.error, variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Erro na API', description: error.message, variant: 'destructive' });
    }
  };

  useEffect(() => {
    const user = getUserData();
    if (user) {
      fetchBalanceAndTickets(user.matricula, user.tipo);
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* SALDO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Restaurante Universitário</h1>
          <p className="text-muted-foreground mt-1">Confira o cardápio e compre seus tickets</p>
        </div>
        <Card className="shadow-card border-2 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
              <p className="text-2xl font-bold text-primary">R$ {balance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARDÁPIO DE HOJE */}
      <Card className="shadow-hover border-2 border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Cardápio de Hoje - {todayMenu.day}</CardTitle>
              <CardDescription className="text-primary-foreground/80 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Prato Principal</h3>
                <p className="text-lg">{todayMenu.mainDish}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Acompanhamento</h3>
                <p className="text-lg">{todayMenu.side}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Sobremesa</h3>
                <p className="text-lg">{todayMenu.dessert}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Bebida</h3>
                <p className="text-lg">{todayMenu.drink}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor do Ticket</p>
                <p className="text-3xl font-bold text-primary">R$ {ticketPrice.toFixed(2)}</p>
              </div>
              <Button size="lg" onClick={handleBuyTicket} className="gap-2">
                <Ticket className="w-5 h-5" />
                Comprar Ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARDÁPIO SEMANAL */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Cardápio da Semana</CardTitle>
          <CardDescription>Segunda a Sexta-feira</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {weeklyMenu.map(menu => (
              <Card key={menu.id} className={`shadow-card ${menu.day === todayMenu.day ? 'border-2 border-primary' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {menu.day}
                    {menu.day === todayMenu.day && <Badge variant="default" className="text-xs">Hoje</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Prato Principal</p>
                    <p className="font-medium line-clamp-2">{menu.mainDish}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sobremesa</p>
                    <p>{menu.dessert}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MEUS TICKETS */}
      {tickets.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
            <CardDescription>Tickets adquiridos para o RU</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket, index) => (
                <Card key={index} className="bg-gradient-hero border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Prato</p>
                        <p className="font-mono text-sm font-medium truncate">{ticket.prato}</p>
                      </div>
                    </div>
                    <Badge className="mt-3 w-full justify-center" variant="outline">
                      Válido para hoje
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Restaurant;
