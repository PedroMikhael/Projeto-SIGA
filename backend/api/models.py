# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Aluno(models.Model):
    matricula_aluno = models.IntegerField(primary_key=True)
    curso = models.CharField(max_length=100, blank=True, null=True)
    fk_cpf = models.ForeignKey('Pessoa', models.DO_NOTHING, db_column='fk_cpf')

    class Meta:
        managed = False
        db_table = 'aluno'


class Avaliacao(models.Model):
    id_avaliacao = models.CharField(primary_key=True, max_length=10)
    
    # Campos simples ao invés de ForeignKey
    fk_matricula_aluno = models.IntegerField()
    fk_cod_disciplina = models.IntegerField()
    fk_cod_turma = models.CharField(max_length=10)
    
    nota = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'avaliacao'
        unique_together = (('id_avaliacao', 'fk_matricula_aluno', 'fk_cod_disciplina', 'fk_cod_turma'),)


class CardapioDia(models.Model):
    id_cardapio = models.IntegerField(primary_key=True)
    prato_principal = models.CharField(max_length=100, blank=True, null=True)
    sobremesa = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cardapio_dia'


class Departamento(models.Model):
    cod_departamento = models.IntegerField(primary_key=True)
    nome_departamento = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'departamento'


class Disciplina(models.Model):
    cod_disciplina = models.IntegerField(primary_key=True)
    nome_disciplina = models.CharField(max_length=100, blank=True, null=True)
    creditos = models.IntegerField(blank=True, null=True)
    fk_cod_departamento = models.ForeignKey(Departamento, models.DO_NOTHING, db_column='fk_cod_departamento', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'disciplina'


class Matricula(models.Model):
    # TRUQUE: Definimos uma coluna como PK pro Django ficar feliz
    fk_matricula_aluno = models.IntegerField(primary_key=True) 
    
    # Removemos as ForeignKeys complexas e deixamos como campos simples
    fk_cod_disciplina = models.IntegerField()
    fk_cod_turma = models.CharField(max_length=10)
    
    frequencia = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'matricula'
        unique_together = (('fk_matricula_aluno', 'fk_cod_disciplina', 'fk_cod_turma'),)


class Pessoa(models.Model):
    cpf = models.CharField(primary_key=True, max_length=14)
    nome = models.CharField(max_length=100)
    email = models.CharField(max_length=100, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)
    senha = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'pessoa'


class Professor(models.Model):
    matricula_professor = models.IntegerField(primary_key=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fk_cod_departamento = models.ForeignKey(Departamento, models.DO_NOTHING, db_column='fk_cod_departamento', blank=True, null=True)
    fk_cpf = models.ForeignKey(Pessoa, models.DO_NOTHING, db_column='fk_cpf')

    class Meta:
        managed = False
        db_table = 'professor'


class RegistroUso(models.Model):
    # Como é chave composta de 3, escolhemos o CPF como a "PK do Django"
    fk_cpf = models.CharField(primary_key=True, max_length=14)
    fk_codigo_ru = models.IntegerField()
    data_hora = models.DateTimeField()
    fk_id_cardapio = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'registro_uso'
        unique_together = (('fk_cpf', 'fk_codigo_ru', 'data_hora'),)


class RestauranteUniversitario(models.Model):
    codigo_ru = models.IntegerField(primary_key=True)
    nome = models.CharField(max_length=100, blank=True, null=True)
    capacidade = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'restaurante_universitario'


class Turma(models.Model):
    pk = models.CompositePrimaryKey('cod_turma', 'fk_cod_disciplina')
    cod_turma = models.CharField(max_length=10)
    fk_cod_disciplina = models.ForeignKey(Disciplina, models.DO_NOTHING, db_column='fk_cod_disciplina')
    semestre = models.CharField(max_length=10, blank=True, null=True)
    horario = models.CharField(max_length=50, blank=True, null=True)
    fk_matricula_prof = models.ForeignKey(Professor, models.DO_NOTHING, db_column='fk_matricula_prof', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'turma'
