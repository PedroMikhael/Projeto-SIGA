"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, Loader2, Filter, BookOpen, Users, CalendarDays, Hash, 
  Edit, GraduationCap, Plus, Clock, Trash2, AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// ==============================
// TIPAGEM
// ==============================
interface Class {
  cod_turma: string; 
  capacidade: number;
  inscritos: number;
  vagas_restantes: number;
  horario: string;
  semester: string;
  disciplina: {
    cod_disciplina: number;
    nome_disciplina: string;
    creditos: number;
  };
  department?: string;
}

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  // === ESTADOS PARA CRIAR/EDITAR ===
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Estado único para formulário
  const [formData, setFormData] = useState({
    nome_disciplina: "",
    cod_departamento: 1,
    semestre: "2025.1",
    capacidade: 30,
    dias: "24",
    turno: "M",
    slot: "AB"
  });

  const resetForm = () => {
    setFormData({
      nome_disciplina: "", cod_departamento: 1, semestre: "2025.1", capacidade: 30,
      dias: "24", turno: "M", slot: "AB"
    });
  };

  // ============================
  // 🔥 CARREGA DADOS
  // ============================
  const loadDisciplines = async () => {
    if (!user?.matricula) return;
    setLoading(true);
    try {
      // CORREÇÃO: URL ajustada (removido o /api extra se o backend já tiver prefixo global)
      // Ajuste conforme sua configuração real. Se der 404, tente com ou sem /api
      const res = await fetch(`http://127.0.0.1:8000/api/professores/${user.matricula}/disciplinas/`);
      
      if (!res.ok) throw new Error("Erro ao buscar");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao carregar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDisciplines(); }, [user]);

  // ============================
  // AÇÃO: CRIAR
  // ============================
  const handleCreate = async () => {
    try {
      // CORREÇÃO: URL ajustada
      const res = await fetch(`http://127.0.0.1:8000/api/professores/${user?.matricula}/criar-disciplina/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();

      toast({ title: "Sucesso!", description: "Disciplina criada.", className: "bg-green-600 text-white" });
      setIsCreateOpen(false);
      resetForm();
      loadDisciplines();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao criar.", variant: "destructive" });
    }
  };

  // ============================
  // AÇÃO: ABRIR EDITAR (Parser de Horário)
  // ============================
  const handleOpenEdit = (cls: Class) => {
    setSelectedClass(cls);
    
    let dias = "24", turno = "M", slot = "AB";
    
    if (cls.horario && cls.horario.length >= 4) {
        const match = cls.horario.match(/(\d+)([MTN])([A-Z]+)/);
        if (match) {
            dias = match[1];
            turno = match[2];
            slot = match[3];
        }
    }

    setFormData({
      nome_disciplina: cls.disciplina.nome_disciplina,
      cod_departamento: 1,
      semestre: cls.semester || "2025.1",
      capacidade: cls.capacidade,
      dias, turno, slot
    });
    setIsEditModalOpen(true);
  };

  // ============================
  // AÇÃO: SALVAR EDIÇÃO
  // ============================
  const handleSaveEdit = async () => {
    if (!selectedClass) return;
    try {
      // CORREÇÃO: URL ajustada
      const res = await fetch(`http://127.0.0.1:8000/api/professores/${user?.matricula}/editar-turma/${selectedClass.cod_turma}/`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error();

      toast({ title: "Atualizado!", description: "Dados alterados com sucesso.", className: "bg-blue-600 text-white" });
      setIsEditModalOpen(false);
      loadDisciplines();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao editar.", variant: "destructive" });
    }
  };

  // ============================
  // AÇÃO: EXCLUIR
  // ============================
  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
        // CORREÇÃO: URL ajustada. Removi a duplicação potencial.
        // A rota final deve ser algo como: /api/professores/1001/excluir-turma/T123/
        const res = await fetch(`http://127.0.0.1:8000/api/professores/${user?.matricula}/excluir-turma/${selectedClass.cod_turma}/`, {
            method: "DELETE"
        });

        if (!res.ok) {
             const errorData = await res.json();
             throw new Error(errorData.error || "Erro ao excluir");
        }

        toast({ title: "Excluído", description: "A disciplina foi removida.", className: "bg-red-600 text-white" });
        setIsEditModalOpen(false);
        loadDisciplines();
    } catch (err: any) {
        console.error(err);
        toast({ title: "Erro", description: err.message || "Não foi possível excluir.", variant: "destructive" });
    }
  };

  // Filtros frontend
  const filteredClasses = classes.filter((cls) => {
    const term = search.toLowerCase();
    return (search === "" || cls.disciplina.nome_disciplina.toLowerCase().includes(term));
  });

  const ProgressBar = ({ current, max }: { current: number; max: number }) => {
    const p = Math.min((current / max) * 100, 100);
    return (
      <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 overflow-hidden">
        <div className={`h-2.5 rounded-full ${p >= 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${p}%` }}></div>
      </div>
    );
  };

  // Componente Reutilizável de Formulário de Horário
  const ScheduleForm = () => (
    <div className="border p-4 rounded-md bg-slate-50 space-y-4 mt-2">
      <h4 className="font-medium flex items-center gap-2 text-sm text-slate-700">
        <Clock size={16} /> Configuração de Horário
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <div>
           <Label className="text-xs text-slate-500">Dias</Label>
           <select 
              className="w-full mt-1 p-2 border rounded text-sm bg-white"
              value={formData.dias}
              onChange={e => setFormData({...formData, dias: e.target.value})}
           >
             <option value="24">Seg / Qua</option>
             <option value="35">Ter / Qui</option>
             <option value="6">Sexta</option>
           </select>
        </div>
        <div>
           <Label className="text-xs text-slate-500">Turno</Label>
           <select 
              className="w-full mt-1 p-2 border rounded text-sm bg-white"
              value={formData.turno}
              onChange={e => setFormData({...formData, turno: e.target.value})}
           >
             <option value="M">Manhã</option>
             <option value="T">Tarde</option>
           </select>
        </div>
        <div>
           <Label className="text-xs text-slate-500">Horário</Label>
           <select 
              className="w-full mt-1 p-2 border rounded text-sm bg-white"
              value={formData.slot}
              onChange={e => setFormData({...formData, slot: e.target.value})}
           >
             <option value="AB">AB (1º Slot)</option>
             <option value="CD">CD (2º Slot)</option>
             <option value="EF">EF (3º Slot)</option>
           </select>
        </div>
      </div>
      <div className="text-xs text-right text-slate-400">
        Código: <strong className="text-slate-700">{formData.dias}{formData.turno}{formData.slot}</strong>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Minhas Turmas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas disciplinas.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus size={18} /> Nova Disciplina
        </Button>
      </div>

      {/* BUSCA */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
        <Search className="text-gray-400" size={18} />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-none shadow-none focus-visible:ring-0" />
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.cod_turma} className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden p-6 flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">{cls.semester}</span>
                    <h2 className="text-xl font-bold mt-2 line-clamp-1">{cls.disciplina.nome_disciplina}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cls)}>
                    <Edit size={16} className="text-gray-400 hover:text-primary"/>
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mt-2">
                   <p className="flex items-center gap-2"><Hash size={14}/> Cód: {cls.disciplina.cod_disciplina}</p>
                   <p className="flex items-center gap-2"><Clock size={14}/> Horário: <strong>{cls.horario || "N/A"}</strong></p>
                </div>

                <div className="mt-auto pt-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ocupação</span>
                      <span className="font-bold">{cls.inscritos}/{cls.capacidade}</span>
                   </div>
                   <ProgressBar current={cls.inscritos} max={cls.capacidade} />
                </div>
            </div>
          ))}
      </div>

      {/* MODAL CRIAR */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Disciplina</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome</Label><Input value={formData.nome_disciplina} onChange={e=>setFormData({...formData, nome_disciplina: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Semestre</Label><Input value={formData.semestre} onChange={e=>setFormData({...formData, semestre: e.target.value})} /></div>
               <div><Label>Depto ID</Label><Input type="number" value={formData.cod_departamento} onChange={e=>setFormData({...formData, cod_departamento: parseInt(e.target.value)})} /></div>
            </div>
            <ScheduleForm />
          </div>
          <DialogFooter><Button onClick={handleCreate}>Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>Alterar dados da turma {selectedClass?.cod_turma}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
                <Label>Nome da Disciplina</Label>
                <Input value={formData.nome_disciplina} onChange={e=>setFormData({...formData, nome_disciplina: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>Semestre</Label><Input value={formData.semestre} onChange={e=>setFormData({...formData, semestre: e.target.value})} /></div>
               <div><Label>Capacidade</Label><Input type="number" value={formData.capacidade} onChange={e=>setFormData({...formData, capacidade: parseInt(e.target.value)})} /></div>
            </div>
            
            <ScheduleForm />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between w-full">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2"><Trash2 size={16}/> Excluir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso apagará permanentemente a disciplina, a turma e removerá todos os alunos inscritos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">Sim, excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}