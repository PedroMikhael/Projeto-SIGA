"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, Award, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// --- Interfaces ---
interface DashboardStat {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}

interface NextClassItem {
  subject: string;
  info: string;
  time: string; // Ex: "Segunda às 07:30"
  timestamp: number; // Para ordenação
}

// --- LÓGICA DE HORÁRIOS UECE (O Coração da correção) ---

// Mapeamento dos códigos de horário (M=Manhã, T=Tarde, N=Noite)
const TIME_SLOTS: Record<string, { h: number; m: number }> = {
  // Manhã
  'MAB': { h: 7, m: 30 }, 'MCD': { h: 9, m: 20 }, 'MEF': { h: 11, m: 10 },
  // Tarde
  'TAB': { h: 13, m: 30 }, 'TCD': { h: 15, m: 20 }, 'TEF': { h: 17, m: 10 },
  // Noite
  'NAB': { h: 18, m: 30 }, 'NCD': { h: 20, m: 20 }, 'NEF': { h: 22, m: 0 }
};

// Mapeamento de dias (2=Segunda ... 6=Sexta)
const WEEK_DAYS: Record<string, number> = {
  '2': 1, // Segunda (JS: 1)
  '3': 2, // Terça
  '4': 3, // Quarta
  '5': 4, // Quinta
  '6': 5  // Sexta
};

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function getNextClassTimeUECE(scheduleCode: string): Date | null {
  if (!scheduleCode || scheduleCode.length < 3) return null;

  // Exemplo de entrada: "24MAB" -> Dias: 2,4 | Turno: MAB
  // Regex para separar digitos (dias) das letras (horário)
  const match = scheduleCode.match(/(\d+)([A-Z]+)/);
  if (!match) return null;

  const daysStr = match[1]; // "24"
  const slotStr = match[2]; // "MAB"

  const slotTime = TIME_SLOTS[slotStr];
  if (!slotTime) return null;

  const now = new Date();
  let nextDate: Date | null = null;

  // Itera sobre os dias da semana presentes no código (ex: 2 e 4)
  for (const char of daysStr) {
    const classDayIndex = WEEK_DAYS[char]; // 1 (Seg) ou 3 (Qua)
    if (classDayIndex === undefined) continue;

    const candidateDate = new Date();
    candidateDate.setHours(slotTime.h, slotTime.m, 0, 0);

    // Calcula diferença de dias
    let diff = classDayIndex - now.getDay();
    
    // Se o dia já passou na semana (ex: hoje é quarta, aula foi segunda) OU é hoje mas já passou a hora
    if (diff < 0 || (diff === 0 && candidateDate < now)) {
      diff += 7; // Joga para a próxima semana
    }

    candidateDate.setDate(now.getDate() + diff);

    // Queremos a data mais próxima (menor timestamp futuro)
    if (!nextDate || candidateDate < nextDate) {
      nextDate = candidateDate;
    }
  }

  return nextDate;
}

function formatNextClass(date: Date) {
  const dayName = DAY_NAMES[date.getDay()];
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${dayName} às ${hour}:${minute}`;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [nextClasses, setNextClasses] = useState<NextClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para garantir que temos o nome do curso correto
  const [userCourse, setUserCourse] = useState("");

  useEffect(() => {
    if (!user) return;

    // Ajuste do Nome do Curso (Fallback para 'curso' se 'course' falhar)
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserCourse(parsed.course || parsed.curso || "Curso não definido");
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user.type === "student") {
            // ============================================
            // ALUNO
            // ============================================
            const [gradesRes, historyRes, disciplinesRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/students/${user.matricula}/grades/`),
                fetch(`http://127.0.0.1:8000/api/students/${user.matricula}/history/`),
                fetch(`http://127.0.0.1:8000/api/disciplines/all/`) // Precisamos disso para pegar o horário "24MAB"
            ]);

            const grades = await gradesRes.json();
            const history = await historyRes.json();
            const allDisciplines = await disciplinesRes.json(); // [{nome_disciplina: "IA", horario: "24MAB"}, ...]

            // Stats
            const mediaGeral = grades.reduce((acc: number, g: any) => acc + g.average, 0) / (grades.length || 1);
            const frequencia = grades.reduce((acc: number, g: any) => acc + g.attendance, 0) / (grades.length || 1);
            const creditos = history.reduce((acc: number, h: any) => acc + h.credits, 0);

            setStats([
                { title: "Disciplinas Cursando", value: grades.length, icon: BookOpen, color: "text-primary" },
                { title: "Média Geral", value: mediaGeral.toFixed(1), icon: TrendingUp, color: "text-green-600" },
                { title: "Frequência Média", value: frequencia.toFixed(0) + "%", icon: Calendar, color: "text-blue-600" },
                { title: "Créditos Concluídos", value: creditos, icon: GraduationCap, color: "text-orange-600" },
            ]);

            // Próximas Aulas (Cruzamento de dados)
            const classesSchedule = grades.map((g: any) => {
                // Encontra a disciplina na lista geral para pegar o horario
                const discInfo = allDisciplines.find((d: any) => d.nome_disciplina === g.subject);
                const horarioCode = discInfo?.horario; // ex: "24MAB"
                
                if (!horarioCode) return null;

                const nextDate = getNextClassTimeUECE(horarioCode);
                if (!nextDate) return null;

                return {
                    subject: g.subject,
                    info: g.professor,
                    time: formatNextClass(nextDate),
                    timestamp: nextDate.getTime()
                };
            }).filter(Boolean).sort((a: any, b: any) => a.timestamp - b.timestamp).slice(0, 3);
            
            setNextClasses(classesSchedule);

        } else if (user.type === "professor") {
            // ============================================
            // PROFESSOR
            // ============================================
            const [reportsRes, classesRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/professores/${user.matricula}/reports/`),
                fetch(`http://127.0.0.1:8000/api/professores/${user.matricula}/disciplinas/`)
            ]);

            const reports = await reportsRes.json();
            const myClasses = await classesRes.json(); // Já vem com 'horario' na query que fizemos antes

            setStats([
                { title: "Total de Alunos", value: reports.kpis.total_students, icon: Users, color: "text-blue-600" },
                { title: "Média Global", value: reports.kpis.global_average, icon: TrendingUp, color: "text-green-600" },
                { title: "Aprovação", value: reports.kpis.approval_rate + "%", icon: Award, color: "text-yellow-600" },
                { title: "Turmas", value: reports.kpis.active_disciplines, icon: BookOpen, color: "text-primary" },
            ]);

            // Próximas Aulas
            const classesSchedule = myClasses.map((c: any) => {
                const horarioCode = c.horario; // ex: "35TCD"
                if (!horarioCode) return null;

                const nextDate = getNextClassTimeUECE(horarioCode);
                if (!nextDate) return null;

                return {
                    subject: c.disciplina.nome_disciplina,
                    info: `Turma ${c.cod_turma} • Sala B${c.cod_turma.slice(-2)}`, // Mock de sala
                    time: formatNextClass(nextDate),
                    timestamp: nextDate.getTime()
                };
            }).filter(Boolean).sort((a: any, b: any) => a.timestamp - b.timestamp).slice(0, 3);

            setNextClasses(classesSchedule);
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return <div className="p-8">Carregando usuário...</div>;
  
  const notifications = [
    { title: "Ajuste de Matrícula", description: "Até 10/01/2026", type: "primary" },
    { title: "Feriado Acadêmico", description: "Não haverá aula dia 15/01", type: "secondary" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">
            {user.type === 'student' 
                ? `Curso: ${userCourse}` 
                : `Departamento: Computação` // Você pode buscar isso do banco se quiser ser dinâmico
            }
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
            Array(4).fill(0).map((_, i) => (
                <Card key={i} className="h-24 bg-muted/20 animate-pulse" />
            ))
        ) : (
            stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-hover transition-all border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
            </Card>
            ))
        )}
      </div>

      {/* PAINEL INFERIOR */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* PRÓXIMAS AULAS */}
        <Card className="shadow-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary"/> Próximas Aulas
            </CardTitle>
            <CardDescription>
                {user.type === 'student' ? 'Seus próximos horários' : 'Sua agenda de ensino'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                  <p className="text-muted-foreground text-sm">Verificando agenda...</p>
              ) : nextClasses.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                      <p>Nenhuma aula encontrada para os próximos dias.</p>
                  </div>
              ) : (
                  nextClasses.map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-primary font-bold text-lg">{new Date().getDay() === WEEK_DAYS[c.time.substring(0, 1)] ? 'HJ' : i+1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.info}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            c.time.includes(DAY_NAMES[new Date().getDay()]) 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-50 text-blue-700"
                        }`}>
                            {c.time.split(' às ')[0]}
                        </span>
                        <p className="text-sm font-bold text-gray-700 mt-1">{c.time.split(' às ')[1]}</p>
                    </div>
                    </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AVISOS */}
        <Card className="shadow-card h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent"/> Mural de Avisos
            </CardTitle>
            <CardDescription>Fique atento aos prazos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-l-4 ${
                    n.type === "primary" ? "border-primary bg-primary/5" : "border-slate-400 bg-slate-50"
                  }`}
                >
                  <h4 className="font-semibold text-sm text-gray-900">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{n.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;