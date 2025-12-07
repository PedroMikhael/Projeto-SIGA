from django.urls import path
from api import views

urlpatterns = [
    # AUTH
    path('auth/register/student/', views.register_student, name='register_student'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/register/professor/', views.register_professor, name='register_professor'),


    # STUDENTS
    path('students/<int:matricula>/update/', views.update_student, name='update_student'),
    path('students/<int:matricula>/delete/', views.delete_student, name='delete_student'),
    path('students/<int:matricula>/grades/', views.get_student_grades, name='student_grades'),
    path('students/<int:matricula>/history/', views.get_student_history, name='student_history'),


    # CLASSES
    path('classes/search/', views.list_available_classes, name='list_classes'),
    path('classes/enroll/', views.enroll_student, name='enroll_student'),
    path('professores/<int:matricula_professor>/alunos-excepcionais/', views.listar_alunos_excepcionais_professor, name='alunos_excepcionais_professor'),
    # DISCIPLINES
    path('disciplines/all/', views.list_all_disciplines, name='list_all_disciplines'),

    # RESTAURANT
    path('restaurant/balance/', views.get_user_balance, name='user_balance'),
    path('restaurant/buy/', views.buy_ticket, name='buy_ticket'),
    path('pessoa/cpf/', views.get_cpf, name='get_cpf'),

    # PROFESSORS
    path('professor/<int:matricula>/update/', views.update_professor, name='update_professor'),
    path('professor/<int:matricula>/gerar_horario/', views.gerar_horario_uece, name='gerar_horario_uece'),
    path('professores/<int:matricula>/disciplinas/', views.listar_disciplinas_professor),
    path('professores/<int:matricula>/criar-disciplina/', views.criar_disciplina_e_turma),
    path('professores/<int:matricula>/editar-turma/<str:cod_turma>/', views.editar_disciplina_turma),
    path('professores/<int:matricula>/excluir-turma/<str:cod_turma>/', views.deletar_disciplina_turma),
    path('professor/<int:matricula>/delete/', views.delete_professor, name='delete_professor'),
    path('professores/<int:matricula>/reports/', views.get_professor_reports, name='professor_reports'),
    path('professores/<int:matricula_professor>/alunos-excepcionais/', views.listar_alunos_excepcionais_professor, name='alunos_excepcionais_professor'),

    #turas 
    path('turma/<str:cod_turma>/<int:cod_disciplina>/alunos/', views.listar_alunos_diario),
    path('turma/<str:cod_turma>/<int:cod_disciplina>/salvar/', views.salvar_notas_diario),
]
