from django.shortcuts import render
from django.contrib import messages
from PIL import Image
import pathlib
from django.http import HttpResponse
import datetime as dt
import os
from .models import Stenography
from django.utils.dateparse import parse_date, parse_time
import socket
# Create your views here.


def main_page(request):
    return render(request, 'index_page.html')


def start_encode(request):

    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        user_ip = x_forwarded_for.split(',')[0]
    else:
        user_ip = request.META.get('REMOTE_ADDR')
    # Getting requester's IP address
    try:
        socket.inet_aton(user_ip)
        ip_valid = True
    except socket.error:
        ip_valid = False

    if not request.session.session_key:
        request.session.save()

    user_session_id = request.session.session_key

    if request.method == 'POST' and ip_valid:
        image = request.FILES.get('image', None)
        text_to_encode = request.POST.get('enc_data')

        if Stenography.objects.filter(session_key=user_session_id, uploaded_on_date=dt.date.today()).exists():
            messages.info(request, 'You have exceeded your limit. Try again later')
            return render(request, 'index_page.html')

        # if text_to_encode == '':
        #     messages.info(request, 'Text not provided!')
        #     return render(request, 'index_page.html')

        if image is None:
            messages.info(request, 'Image not provided!')
            return render(request, 'index_page.html')

        check_d = bool(request.POST.get('enc_data', False))

        if not check_d:
            messages.info(request, 'Text not provided!')
            return render(request, 'index_page.html')

        Stenography.objects.create(user_ip=user_ip, uploaded_image=image, msg_to_encode=text_to_encode, session_key=
                                   user_session_id)

        img = Image.open(image, 'r')

        newimg = img.copy()

        apply_encoder(newimg, text_to_encode)
        crr_path = pathlib.Path().absolute()
        newimg.save(f'{crr_path}\\encodedimages\\{user_session_id}', 'png')

        with open(f'{crr_path}\\encodedimages\\{user_session_id}', 'rb') as imagefile:
            send_image = HttpResponse(imagefile, content_type='image/png')
            send_image['Content-Disposition'] = f'attachment; filename=encoded_{str(image)}'

        os.remove(f'{crr_path}\\encodedimages\\{user_session_id}')
        return send_image


# Static Function for encoding images:
def generate_data(data):

    new_data = []

    for i in data:
        new_data.append(format(ord(i), '08b'))
    return new_data


def modify_image(pix, i_data):

    data_list = generate_data(i_data)
    len_of_dlist = len(data_list)
    image_data = iter(pix)

    for i in range(len_of_dlist):

        pix = [value for value in image_data.__next__()[:3] +
               image_data.__next__()[:3] +
               image_data.__next__()[:3]]

        for k in range(0, 8):
            if data_list[i][k] == '0' and pix[k] % 2 != 0:
                pix[k] -= 1

            elif data_list[i][k] == '1' and pix[k] % 2 == 0:
                if pix[k] != 0:
                    pix[k] -= 1
                else:
                    pix[k] += 1

        if i == len_of_dlist - 1:
            if pix[-1] % 2 == 0:
                if pix[-1] != 0:
                    pix[-1] -= 1
                else:
                    pix[-1] += 1
        else:
            if pix[-1] % 2 != 0:
                pix[-1] -= 1

        pix = tuple(pix)

        yield pix[0:3]
        yield pix[3:6]
        yield pix[6:9]


def apply_encoder(new_image, enc_data):

    i_length = new_image.size[0]
    (x, y) = 0, 0

    for pixel in modify_image(new_image.getdata(), enc_data):

        new_image.putpixel((x, y), pixel)
        if x == i_length - 1:
            x = 0
            y += 1
        else:
            x += 1