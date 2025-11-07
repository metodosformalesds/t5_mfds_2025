# core/utils/s3_utils.py

import boto3
import uuid
from django.conf import settings
from botocore.exceptions import ClientError
import mimetypes


class S3Handler:
    """Clase para manejar operaciones con S3"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    
    def upload_file(self, file, folder='uploads'):
        """
        Sube un archivo a S3 y retorna la URL pública
        
        Args:
            file: Archivo de Django (UploadedFile)
            folder: Carpeta dentro del bucket (ej: 'products', 'profiles')
        
        Returns:
            str: URL pública del archivo subido
        """
        try:
            # Generar nombre único
            extension = file.name.split('.')[-1]
            file_name = f"{folder}/{uuid.uuid4()}.{extension}"
            
            # Detectar content type
            content_type, _ = mimetypes.guess_type(file.name)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Subir archivo
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                file_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'
                }
            )
            
            # Construir URL pública
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{file_name}"
            return url
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            return None
    
    def delete_file(self, file_url):
        """
        Elimina un archivo de S3 dado su URL
        
        Args:
            file_url: URL completa del archivo en S3
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            # Extraer key del URL
            key = file_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
            
        except ClientError as e:
            print(f"Error deleting from S3: {e}")
            return False
    
    def upload_multiple(self, files, folder='uploads'):
        """
        Sube múltiples archivos y retorna lista de URLs
        
        Args:
            files: Lista de archivos
            folder: Carpeta destino
        
        Returns:
            list: Lista de URLs de los archivos subidos
        """
        urls = []
        for file in files:
            url = self.upload_file(file, folder)
            if url:
                urls.append(url)
        return urls


# Funciones helper para usar en views
def upload_product_image(image_file):
    """Sube imagen de producto a S3"""
    handler = S3Handler()
    return handler.upload_file(image_file, folder='products')


def upload_profile_image(image_file):
    """Sube imagen de perfil a S3"""
    handler = S3Handler()
    return handler.upload_file(image_file, folder='profiles')


def upload_exchange_image(image_file):
    """Sube imagen de intercambio a S3"""
    handler = S3Handler()
    return handler.upload_file(image_file, folder='exchanges')


def delete_image(image_url):
    """Elimina imagen de S3"""
    handler = S3Handler()
    return handler.delete_file(image_url)