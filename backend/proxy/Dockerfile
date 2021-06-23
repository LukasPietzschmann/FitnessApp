#Author: Johannes Wimmer

FROM python:3.9
WORKDIR /app

COPY ./requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY ["./proxy", "." ]


CMD [ "python3", "api.py" ]