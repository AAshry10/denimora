from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from rest_framework import viewsets
from django.conf import settings
from storage.github_storage import GitHubMediaStorage


class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    
    class Meta:
        ordering = ('name',)
        indexes = [
            models.Index(fields=['id', 'slug'])
        ]
        verbose_name = 'category'
        verbose_name_plural = 'categories'
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('products:product_list_by_category', args=[self.slug])
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Size(models.Model):
    name = models.CharField(max_length=10)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ('order',)
    
    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    image = models.ImageField(upload_to='products/%Y/%m/%d', blank=True, storage=GitHubMediaStorage())
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sizes = models.ManyToManyField(Size, related_name='products', blank=True)
    stock = models.PositiveIntegerField(default=1)
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False)  
    
    class Meta:
        ordering = ('name',)
        indexes = [
            models.Index(fields=['id', 'slug'])
        ]
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('products:product_detail', args=[self.id, self.slug])
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        
    @property
    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            # Get the backend URL from settings
            backend_url = getattr(settings, 'BACKEND_URL', '')
            if backend_url:
                return f"{backend_url.rstrip('/')}{self.image.url}"
            return self.image.url
        return '/static/Assets/Shop/default-product.jpg'


class ProductSize(models.Model):
    """
    Represents the stock quantity for a specific product-size combination
    """
    product = models.ForeignKey(Product, related_name='product_sizes', on_delete=models.CASCADE)
    size = models.ForeignKey(Size, related_name='product_sizes', on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ('product', 'size')
    
    def __str__(self):
        return f"{self.product.name} - {self.size.name} ({self.stock} in stock)"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='detail_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/details/%Y/%m/%d', storage=GitHubMediaStorage())
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for {self.product.name}"

    @property
    def image_url(self):
        if self.image and hasattr(self.image, 'url'):
            # Get the backend URL from settings
            backend_url = getattr(settings, 'BACKEND_URL', '')
            if backend_url:
                return f"{backend_url.rstrip('/')}{self.image.url}"
            return self.image.url
        return ''


