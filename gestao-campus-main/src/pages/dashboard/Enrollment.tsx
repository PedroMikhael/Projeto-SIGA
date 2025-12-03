import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Users, Calendar, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvailableClass {
  id: string;
  name: string;
  professor: string;
  department: string;
  semester: string;
  schedule: string;
  capacity: number;
  enrolled: number;
}

const Enrollment = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  
  const [availableClasses] = useState<AvailableClass[]>([
    { 
      id: '1', 
      name: 'Algoritmos e Programação I', 
      professor: 'Prof. Carlos Silva',
      department: 'Computação',
      semester: '2025.1',
      schedule: 'Seg/Qua 08:00-10:00',
      capacity: 40,
      enrolled: 32
    },
    { 
      id: '2', 
      name: 'Banco de Dados', 
      professor: 'Prof. Maria Santos',
      department: 'Computação',
      semester: '2025.1',
      schedule: 'Ter/Qui 10:00-12:00',
      capacity: 35,
      enrolled: 28
    },
    { 
      id: '3', 
      name: 'Estruturas de Dados', 
      professor: 'Prof. João Oliveira',
      department: 'Computação',
      semester: '2025.1',
      schedule: 'Seg/Qua 14:00-16:00',
      capacity: 30,
      enrolled: 25
    },
  ]);

  const filteredClasses = availableClasses.filter(cls => {
    if (!searchTerm) return true;
    
    const searchIn = caseInsensitive ? searchTerm.toLowerCase() : searchTerm;
    const className = caseInsensitive ? cls.name.toLowerCase() : cls.name;
    const profName = caseInsensitive ? cls.professor.toLowerCase() : cls.professor;
    
    return className.includes(searchIn) || profName.includes(searchIn);
  });

  const handleEnroll = (classItem: AvailableClass) => {
    toast({
      title: 'Matrícula realizada com sucesso!',
      description: `Você foi matriculado em ${classItem.name}`,
    });
  };

  const getAvailabilityColor = (cls: AvailableClass) => {
    const percentage = (cls.enrolled / cls.capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Matrícula Online</h1>
        <p className="text-muted-foreground mt-1">Inscreva-se nas disciplinas disponíveis</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por disciplina ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="case-insensitive"
                checked={caseInsensitive}
                onCheckedChange={(checked) => setCaseInsensitive(checked as boolean)}
              />
              <Label htmlFor="case-insensitive" className="text-sm cursor-pointer">
                Ignorar Maiúsculas/Minúsculas (Case Insensitive)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="shadow-card hover:shadow-hover transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <CardDescription className="mt-1">{cls.professor}</CardDescription>
                </div>
                <Badge variant="outline">{cls.semester}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className={getAvailabilityColor(cls)}>
                    {cls.enrolled} / {cls.capacity} vagas
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all"
                  style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleEnroll(cls)}
                disabled={cls.enrolled >= cls.capacity}
              >
                {cls.enrolled >= cls.capacity ? 'Turma Cheia' : 'Inscrever-se'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma disciplina encontrada com "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Enrollment;
