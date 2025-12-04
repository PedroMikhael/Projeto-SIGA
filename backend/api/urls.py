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

    # DISCIPLINES
    path('disciplines/all/', views.list_all_disciplines, name='list_all_disciplines'),

    # RESTAURANT
    path('restaurant/balance/', views.get_user_balance, name='user_balance'),
    path('restaurant/buy/', views.buy_ticket, name='buy_ticket'),
    path('pessoa/cpf/', views.get_cpf, name='get_cpf'),

    # PROFESSORS
    path('professor/<int:matricula>/update/', views.update_professor, name='update_professor'),

]
