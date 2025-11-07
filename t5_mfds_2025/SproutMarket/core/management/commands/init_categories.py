# core/management/commands/init_categories.py

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Category


class Command(BaseCommand):
    help = 'Inicializa las 4 categorías fijas del sistema'

    def handle(self, *args, **kwargs):
        """Crea las categorías predefinidas"""
        
        categories = [
            {
                'name': 'Plantas',
                'slug': 'plantas',
                'description': 'Plantas ornamentales, frutales, suculentas y más',
                'icon': 'plant',
                'order': 1
            },
            {
                'name': 'Semillas',
                'slug': 'semillas',
                'description': 'Semillas de flores, hortalizas, árboles y plantas',
                'icon': 'seed',
                'order': 2
            },
            {
                'name': 'Insumos',
                'slug': 'insumos',
                'description': 'Tierra, fertilizantes, abonos y sustratos',
                'icon': 'fertilizer',
                'order': 3
            },
            {
                'name': 'Herramientas y Accesorios',
                'slug': 'herramientas-y-accesorios',
                'description': 'Macetas, herramientas de jardín y accesorios',
                'icon': 'tools',
                'order': 4
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for cat_data in categories:
            category, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'icon': cat_data['icon'],
                    'order': cat_data['order'],
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Categoría creada: {category.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Categoría actualizada: {category.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Proceso completado: {created_count} creadas, {updated_count} actualizadas'
            )
        )