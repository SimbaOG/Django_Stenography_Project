from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.main_page, name='main_page'),
    path('enc_img', views.start_encode, name='start_encode'),
    path('img_encoder', views.show_encode_page, name='show_encode_page'),
    path('img_decoder', views.show_decode_page, name='show_decode_page'),
    path('dec_img', views.start_decode, name='start_decode')
]