import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  day: string;
  time: string;
}

interface Class {
  id: string;
  name: string;
  department: string;
  semester: string;
  capacity: number;
  enrolled: number;
  schedules: Schedule[];
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const TIMES = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

const Classes = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([
    { 
      id: '1', 
      name: 'Algoritmos e Programação I', 
      department: 'computacao', 
      semester: '2025.1', 
      capacity: 40, 
      enrolled: 32,
      schedules: [{ day: 'Segunda', time: '08:00' }, { day: 'Quarta', time: '08:00' }]
    },
    { 
      id: '2', 
      name: 'Banco de Dados', 
      department: 'computacao', 
      semester: '2025.1', 
      capacity: 35, 
      enrolled: 28,
      schedules: [{ day: 'Terça', time: '10:00' }, { day: 'Quinta', time: '10:00' }]
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    semester: '',
    capacity: 30,
    schedules: [] as Schedule[]
  });

  const handleScheduleToggle = (day: string, time: string) => {
    const exists = formData.schedules.some(s => s.day === day && s.time === time);
    if (exists) {
      setFormData({
        ...formData,
        schedules: formData.schedules.filter(s => !(s.day === day && s.time === time))
      });
    } else {
      setFormData({
        ...formData,
        schedules: [...formData.schedules, { day, time }]
      });
    }
  };

  const isScheduleSelected = (day: string, time: string) => {
    return formData.schedules.some(s => s.day === day && s.time === time);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClass) {
      setClasses(classes.map(c => 
        c.id === editingClass.id 
          ? { ...c, ...formData }
          : c
      ));
      toast({ title: 'Turma atualizada com sucesso!' });
    } else {
      const newClass: Class = {
        id: Date.now().toString(),
        ...formData,
        enrolled: 0
      };
      setClasses([...classes, newClass]);
      toast({ title: 'Turma criada com sucesso!' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      department: classItem.department,
      semester: classItem.semester,
      capacity: classItem.capacity,
      schedules: classItem.schedules || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({ title: 'Turma excluída com sucesso!' });
  };

  const resetForm = () => {
    setFormData({ name: '', department: '', semester: '', capacity: 30, schedules: [] });
    setEditingClass(null);
  };

  const departments = [
    { value: 'computacao', label: 'Computação' },
    { value: 'matematica', label: 'Matemática' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'engenharia', label: 'Engenharia' }
  ];

  const formatSchedules = (schedules: Schedule[]) => {
    if (!schedules || schedules.length === 0) return 'Sem horários';
    return schedules.map(s => `${s.day.substring(0, 3)} ${s.time}`).join(', ');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Minhas Turmas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas turmas e disciplinas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClass ? 'Editar Turma' : 'Criar Nova Turma'}</DialogTitle>
              <DialogDescription>
                Preencha os dados da disciplina e turma
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Disciplina</Label>
                <Input
                  id="name"
                  placeholder="Ex: Algoritmos e Programação"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre</Label>
                <Input
                  id="semester"
                  placeholder="Ex: 2025.1"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade Máxima</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Horários</Label>
                <p className="text-sm text-muted-foreground mb-2">Selecione os dias e horários das aulas</p>
                <div className="border rounded-lg p-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2"></th>
                        {DAYS.map(day => (
                          <th key={day} className="text-center p-2 font-medium">{day.substring(0, 3)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIMES.map(time => (
                        <tr key={time}>
                          <td className="p-2 font-medium text-muted-foreground">{time}</td>
                          {DAYS.map(day => (
                            <td key={`${day}-${time}`} className="text-center p-2">
                              <Checkbox
                                checked={isScheduleSelected(day, time)}
                                onCheckedChange={() => handleScheduleToggle(day, time)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {formData.schedules.length > 0 && (
                  <p className="text-sm text-primary mt-2">
                    Selecionados: {formatSchedules(formData.schedules)}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full">
                {editingClass ? 'Atualizar' : 'Criar'} Turma
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="shadow-card hover:shadow-hover transition-all">
            <CardHeader>
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
              <CardDescription>
                {departments.find(d => d.value === classItem.department)?.label} • {classItem.semester}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{classItem.enrolled} / {classItem.capacity} alunos</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all"
                  style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                />
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{formatSchedules(classItem.schedules)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(classItem)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(classItem.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;
