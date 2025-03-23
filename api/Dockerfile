FROM python:3.12

WORKDIR /api

COPY requirements.txt requirements.txt

RUN pip3 install --upgrade setuptools
RUN pip3 install -r requirements.txt

RUN chmod 755 .

EXPOSE 8080

COPY . .