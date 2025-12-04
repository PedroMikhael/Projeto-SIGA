from .auth_views import register_student, login_user
from .student_views import update_student, delete_student
from .enrollment_views import (
    list_available_classes,
    enroll_student,
    list_all_disciplines,
    search_disciplines
)
from .grades_views import get_student_grades
from .restaurant_views import get_user_balance, buy_ticket
