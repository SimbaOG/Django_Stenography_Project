from django.db import models

# Create your models here.


class Stenography(models.Model):

    user_ip = models.TextField(max_length=15)
    uploaded_image = models.ImageField(upload_to='up_pictures')
    msg_to_encode = models.TextField(max_length=250)
    session_key = models.TextField(unique=True)
    uploaded_on_date = models.DateField(auto_now_add=True)
    uploaded_on_time = models.TimeField(auto_now_add=True)