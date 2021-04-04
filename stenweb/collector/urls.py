from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.main_page, name='main_page'),
    path('enc_img', views.start_encode, name='start_encode')
]