from rest_framework import serializers
from products.models import Product, Category, Size, ProductImage, ProductSize


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'order']


class ProductSizeSerializer(serializers.ModelSerializer):
    size = SizeSerializer(read_only=True)
    
    class Meta:
        model = ProductSize
        fields = ['id', 'size', 'stock']


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text']

    def get_image_url(self, obj):
        # Use the model's image_url property which handles GitHub URLs
        return obj.image_url


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    available_sizes = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    detail_images = serializers.SerializerMethodField()
    has_discount = serializers.ReadOnlyField()
    display_price = serializers.ReadOnlyField()
    original_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'image_url', 'description', 
            'price', 'discount_active', 'discount_percent', 'price_after_discount', 'stock', 'available', 'category', 'sizes',
            'is_featured', 'detail_images', 'available_sizes', 'created', 'updated',
            'has_discount', 'display_price', 'original_price'
        ]

    def get_image_url(self, obj):
        # Use the model's image_url property which handles GitHub URLs
        return obj.image_url

    def get_detail_images(self, obj):
        detail_images = obj.detail_images.all()
        return ProductImageSerializer(detail_images, many=True).data
    
    def get_available_sizes(self, obj):
        """Returns sizes that have stock available"""
        product_sizes = obj.product_sizes.filter(stock__gt=0)
        return ProductSizeSerializer(product_sizes, many=True).data