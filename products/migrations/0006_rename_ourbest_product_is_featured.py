# Generated by Django 5.2.2 on 2025-06-08 14:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_rename_is_featured_product_ourbest'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='ourbest',
            new_name='is_featured',
        ),
    ]
