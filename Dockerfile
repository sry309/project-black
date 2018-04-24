FROM ubuntu:16.04

# If you prefer miniconda:
#FROM continuumio/miniconda3

LABEL Name=front_black Version=1.0.0
EXPOSE 5000

RUN apt update && apt install -y \
    masscan \
    nmap \
    python3 \
    python3-pip \
    sudo \
    tmux

RUN python3 -m pip install --upgrade pip

WORKDIR /app
ADD . /app

RUN python3 -m pip install -r requirements.txt
RUN python3 -m pip install -r black/requirements.txt

CMD ["/bin/bash", "./start_all.sh"]
