from rest_framework import serializers

class StudentUpdateSerializer(serializers.Serializer):
    nome = serializers.CharField()
    email = serializers.EmailField()
    senha = serializers.CharField(required=False)
    curso = serializers.CharField()

class ProfessorUpdateSerializer(serializers.Serializer):
    nome = serializers.CharField()
    email = serializers.EmailField()
    senha = serializers.CharField(required=False)
    departamento = serializers.CharField()
