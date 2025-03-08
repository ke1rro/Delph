FROM python:3.12

WORKDIR /api

COPY requirements.txt .

RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod 755 .

EXPOSE 8000

COPY . .

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080" ]
