# products/permissions.py

from rest_framework import permissions


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado:
    - Lectura: cualquiera (incluso no autenticados)
    - Escritura: solo el vendedor del producto
    """
    
    def has_permission(self, request, view):
        """Permitir lectura a todos, escritura solo a autenticados"""
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Permitir lectura a todos.
        Escritura solo al dueño del producto.
        """
        # Lectura permitida para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Escritura solo para el seller o admin
        return obj.seller == request.user or request.user.is_staff