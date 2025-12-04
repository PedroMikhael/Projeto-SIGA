import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Calendar, Ticket, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Restaurant = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<string[]>([]);
  const [balance, setBalance] = useState(15.00);
  
  const weeklyMenu = [
    {
      day: 'Segunda',
      mainDish: 'Frango Grelhado com Arroz Integral e Feijão Preto',
      side: 'Salada de Folhas Verdes',
      dessert: 'Pudim de Leite',
      drink: 'Suco de Laranja'
    },
    {
      day: 'Terça',
      mainDish: 'Carne de Panela com Batatas',
      side: 'Legumes Salteados',
      dessert: 'Gelatina',
      drink: 'Suco de Maracujá'
    },
    {
      day: 'Quarta',
      mainDish: 'Peixe Assado com Arroz e Farofa',
      side: 'Salada Tropical',
      dessert: 'Mousse de Chocolate',
      drink: 'Suco de Abacaxi'
    },
    {
      day: 'Quinta',
      mainDish: 'Strogonoff de Frango com Arroz e Batata Palha',
      side: 'Salada Caesar',
      dessert: 'Doce de Leite',
      drink: 'Suco de Goiaba'
    },
    {
      day: 'Sexta',
      mainDish: 'Feijoada Completa',
      side: 'Couve Refogada e Farofa',
      dessert: 'Laranja',
      drink: 'Suco de Limão'
    }
  ];

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayMenu = dayOfWeek >= 1 && dayOfWeek <= 5 ? weeklyMenu[dayOfWeek - 1] : weeklyMenu[0];
  const ticketPrice = 1.00;

  const handleBuyTicket = () => {
    if (balance < ticketPrice) {
      toast({
        title: 'Saldo insuficiente!',
        description: 'Você não tem saldo suficiente para comprar o ticket.',
        variant: 'destructive'
      });
      return;
    }

    const ticketId = `TICKET-${Date.now()}`;
    setTickets([...tickets, ticketId]);
    setBalance(prev => prev - ticketPrice);
    
    toast({
      title: 'Ticket comprado com sucesso!',
      description: `Código: ${ticketId}`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
                {today.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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
                <p className="text-3xl font-bold text-primary">
                  R$ {ticketPrice.toFixed(2)}
                </p>
              </div>
              <Button size="lg" onClick={handleBuyTicket} className="gap-2">
                <Ticket className="w-5 h-5" />
                Comprar Ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Cardápio da Semana</CardTitle>
          <CardDescription>Segunda a Sexta-feira</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {weeklyMenu.map((menu, index) => (
              <Card key={index} className={`shadow-card ${menu.day === todayMenu.day ? 'border-2 border-primary' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {menu.day}
                    {menu.day === todayMenu.day && (
                      <Badge variant="default" className="text-xs">Hoje</Badge>
                    )}
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

      {tickets.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
            <CardDescription>Tickets adquiridos para o RU</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticketId) => (
                <Card key={ticketId} className="bg-gradient-hero border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Código</p>
                        <p className="font-mono text-sm font-medium truncate">{ticketId}</p>
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
