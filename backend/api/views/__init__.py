from .auth_views import register_student, login_user, register_professor
from .student_views import update_student, delete_student
from .enrollment_views import (
    list_available_classes,
    enroll_student,
    list_all_disciplines,
    search_disciplines
)
from .grades_views import get_student_grades, get_student_history
from .restaurant_views import get_user_balance, buy_ticket, get_cpf,get_cpf_by_matricula_tipo
from .professor_views import update_professor, listar_disciplinas_professor, gerar_horario_uece, criar_disciplina_e_turma, editar_disciplina_turma, deletar_disciplina_turma, delete_professor,get_professor_reports
from .class_views import listar_alunos_diario, salvar_notas_diario